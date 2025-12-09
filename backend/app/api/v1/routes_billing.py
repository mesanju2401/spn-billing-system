from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime
from app.db.session import get_db
from app.models.product import Product
from app.models.offer import Offer, OfferType
from app.models.stock import Stock
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.invoice import (
    InvoiceItemInput,
    InvoiceItemDetail,
    InvoicePreview,
    InvoiceConfirmRequest,
    InvoiceResponse
)

router = APIRouter(prefix="/billing", tags=["Billing"])


def calculate_offer_discount(quantity: int, unit_price: float, offer: Offer) -> tuple[float, float, str]:
    """
    Calculate discount based on offer type
    Returns: (discounted_price, total_discount, offer_description)
    """
    
    if offer.offer_type == OfferType.BUY_X_GET_Y:
        # B1G1: Every 2 items, charge for 1
        # B2G1: Every 3 items, charge for 2
        x = offer.x_quantity
        y = offer.y_quantity
        
        sets = quantity // (x + y)
        remaining = quantity % (x + y)
        
        chargeable = (sets * x) + remaining
        discount = (quantity - chargeable) * unit_price
        
        return chargeable * unit_price, discount, f"Buy {x} Get {y} Free"
    
    elif offer.offer_type == OfferType.PERCENTAGE:
        discount_per_unit = unit_price * (offer.discount_percent / 100)
        total_discount = discount_per_unit * quantity
        final_price = (unit_price * quantity) - total_discount
        
        return final_price, total_discount, f"{offer.discount_percent}% Off"
    
    elif offer.offer_type == OfferType.FLAT:
        discount_per_unit = min(offer.discount_flat, unit_price)  # Can't discount more than price
        total_discount = discount_per_unit * quantity
        final_price = (unit_price * quantity) - total_discount
        
        return final_price, total_discount, f"₹{offer.discount_flat} Off per item"
    
    return unit_price * quantity, 0.0, "No Offer"


@router.post("/preview", response_model=InvoicePreview)
def preview_invoice(items: list[InvoiceItemInput], db: Session = Depends(get_db)):
    """Preview invoice with offers applied (doesn't save to DB)"""
    
    today = date.today()
    item_details = []
    subtotal = 0.0
    total_discount = 0.0
    
    for item in items:
        # Get product
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        
        # Get active offer
        offer = db.query(Offer).filter(
            Offer.product_id == product.id,
            Offer.is_active == True,
            Offer.start_date <= today,
            Offer.end_date >= today
        ).first()
        
        # Calculate pricing
        unit_price = product.selling_price
        
        if offer:
            line_total, discount, offer_desc = calculate_offer_discount(
                item.quantity, unit_price, offer
            )
        else:
            line_total = unit_price * item.quantity
            discount = 0.0
            offer_desc = None
        
        subtotal += (unit_price * item.quantity)
        total_discount += discount
        
        item_details.append(InvoiceItemDetail(
            product_id=product.product_id,
            product_name=product.name,
            quantity=item.quantity,
            unit_price=unit_price,
            discount=discount,
            line_total=line_total,
            offer_applied=offer_desc
        ))
    
    final_total = subtotal - total_discount
    
    return InvoicePreview(
        items=item_details,
        subtotal=subtotal,
        total_discount=total_discount,
        final_total=final_total
    )


@router.post("/confirm", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def confirm_invoice(request: InvoiceConfirmRequest, db: Session = Depends(get_db)):
    """Confirm invoice - save to DB and reduce stock"""
    
    today = date.today()
    item_details = []
    subtotal = 0.0
    total_discount = 0.0
    
    # First, validate all products and stock
    for item in request.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        
        # Check stock availability
        stock = db.query(Stock).filter(
            Stock.product_id == product.id,
            Stock.outlet_id == request.outlet_id
        ).first()
        
        if not stock or stock.quantity < item.quantity:
            available = stock.quantity if stock else 0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Available: {available}, Requested: {item.quantity}"
            )
    
    # Generate invoice number
    invoice_count = db.query(Invoice).count()
    invoice_number = f"INV{datetime.now().strftime('%Y%m%d')}{invoice_count + 1:04d}"
    
    # Create invoice
    db_invoice = Invoice(
        invoice_number=invoice_number,
        total_amount=0.0,  # Will update after processing items
        discount_amount=0.0,
        final_amount=0.0,
        notes=request.notes
    )
    db.add(db_invoice)
    db.flush()  # Get invoice.id
    
    # Process each item
    for item in request.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        
        # Get active offer
        offer = db.query(Offer).filter(
            Offer.product_id == product.id,
            Offer.is_active == True,
            Offer.start_date <= today,
            Offer.end_date >= today
        ).first()
        
        # Calculate pricing
        unit_price = product.selling_price
        
        if offer:
            line_total, discount, offer_desc = calculate_offer_discount(
                item.quantity, unit_price, offer
            )
        else:
            line_total = unit_price * item.quantity
            discount = 0.0
            offer_desc = None
        
        subtotal += (unit_price * item.quantity)
        total_discount += discount
        
        # Create invoice item
        db_invoice_item = InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=unit_price,
            discount=discount,
            line_total=line_total,
            offer_applied=offer_desc
        )
        db.add(db_invoice_item)
        
        # Reduce stock
        stock = db.query(Stock).filter(
            Stock.product_id == product.id,
            Stock.outlet_id == request.outlet_id
        ).first()
        stock.quantity -= item.quantity
        
        item_details.append(InvoiceItemDetail(
            product_id=product.product_id,
            product_name=product.name,
            quantity=item.quantity,
            unit_price=unit_price,
            discount=discount,
            line_total=line_total,
            offer_applied=offer_desc
        ))
    
    # Update invoice totals
    final_total = subtotal - total_discount
    db_invoice.total_amount = subtotal
    db_invoice.discount_amount = total_discount
    db_invoice.final_amount = final_total
    
    db.commit()
    db.refresh(db_invoice)
    
    return InvoiceResponse(
        id=db_invoice.id,
        invoice_number=db_invoice.invoice_number,
        total_amount=float(db_invoice.total_amount),
        discount_amount=float(db_invoice.discount_amount),
        final_amount=float(db_invoice.final_amount),
        created_at=db_invoice.created_at,
        items=item_details
    )