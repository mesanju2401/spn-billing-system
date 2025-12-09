from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.db.session import get_db
from app.models.product import Product
from app.models.stock import Stock
from app.models.outlet import Outlet
from app.schemas.stock import StockCreate, StockResponse, StockUpdate, LowStockResponse
from app.schemas.outlet import OutletCreate, OutletResponse, OutletUpdate, OutletWithStock

router = APIRouter(prefix="/stock", tags=["Stock"])


# ==================== OUTLET ENDPOINTS ====================

@router.post("/outlets/", response_model=OutletResponse, status_code=status.HTTP_201_CREATED)
def create_outlet(outlet: OutletCreate, db: Session = Depends(get_db)):
    """Create a new outlet"""
    
    # Check if outlet name already exists
    existing_outlet = db.query(Outlet).filter(Outlet.name == outlet.name).first()
    if existing_outlet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Outlet with name '{outlet.name}' already exists"
        )
    
    db_outlet = Outlet(**outlet.model_dump())
    db.add(db_outlet)
    db.commit()
    db.refresh(db_outlet)
    
    return db_outlet


@router.get("/outlets/", response_model=list[OutletResponse])
def list_outlets(active_only: bool = False, db: Session = Depends(get_db)):
    """List all outlets"""
    query = db.query(Outlet)
    
    if active_only:
        query = query.filter(Outlet.is_active == True)
    
    return query.all()


@router.get("/outlets/{outlet_id}", response_model=OutletWithStock)
def get_outlet(outlet_id: int, db: Session = Depends(get_db)):
    """Get outlet details with stock summary"""
    
    outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    if not outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outlet ID {outlet_id} not found"
        )
    
    # Calculate stock summary
    stock_records = db.query(Stock).filter(Stock.outlet_id == outlet_id).all()
    
    total_products = len(stock_records)
    total_quantity = sum(stock.quantity for stock in stock_records)
    low_stock_count = sum(
        1 for stock in stock_records 
        if stock.quantity < stock.product.min_stock
    )
    
    return OutletWithStock(
        **outlet.__dict__,
        total_products=total_products,
        total_quantity=total_quantity,
        low_stock_count=low_stock_count
    )


@router.put("/outlets/{outlet_id}", response_model=OutletResponse)
def update_outlet(outlet_id: int, outlet_update: OutletUpdate, db: Session = Depends(get_db)):
    """Update outlet details"""
    
    db_outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    if not db_outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outlet ID {outlet_id} not found"
        )
    
    # Update only provided fields
    update_data = outlet_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_outlet, field, value)
    
    db.commit()
    db.refresh(db_outlet)
    
    return db_outlet


@router.delete("/outlets/{outlet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_outlet(outlet_id: int, db: Session = Depends(get_db)):
    """Delete an outlet (only if no stock records exist)"""
    
    db_outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    if not db_outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outlet ID {outlet_id} not found"
        )
    
    # Check if outlet has stock
    stock_count = db.query(Stock).filter(Stock.outlet_id == outlet_id).count()
    if stock_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete outlet with existing stock. Move or delete {stock_count} stock records first."
        )
    
    db.delete(db_outlet)
    db.commit()
    
    return None


# ==================== STOCK ENDPOINTS ====================

@router.post("/", response_model=StockResponse, status_code=status.HTTP_201_CREATED)
def create_stock_entry(stock: StockCreate, db: Session = Depends(get_db)):
    """Create or add to stock entry"""
    
    # Verify product exists
    product = db.query(Product).filter(Product.id == stock.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID {stock.product_id} not found"
        )
    
    # Verify outlet exists if provided
    if stock.outlet_id:
        outlet = db.query(Outlet).filter(Outlet.id == stock.outlet_id).first()
        if not outlet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Outlet ID {stock.outlet_id} not found"
            )
        
        if not outlet.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Outlet '{outlet.name}' is inactive"
            )
    
    # Check if stock entry already exists
    existing_stock = db.query(Stock).filter(
        and_(
            Stock.product_id == stock.product_id,
            Stock.outlet_id == stock.outlet_id
        )
    ).first()
    
    if existing_stock:
        # Update existing stock (add to existing quantity)
        existing_stock.quantity += stock.quantity
        db.commit()
        db.refresh(existing_stock)
        return existing_stock
    else:
        # Create new stock entry
        db_stock = Stock(**stock.model_dump())
        db.add(db_stock)
        db.commit()
        db.refresh(db_stock)
        return db_stock


@router.put("/{stock_id}", response_model=StockResponse)
def update_stock(stock_id: int, stock_update: StockUpdate, db: Session = Depends(get_db)):
    """Update stock quantity (absolute value, not incremental)"""
    
    db_stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if not db_stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock entry {stock_id} not found"
        )
    
    db_stock.quantity = stock_update.quantity
    db.commit()
    db.refresh(db_stock)
    
    return db_stock


@router.get("/", response_model=list[StockResponse])
def list_stock(
    product_id: int | None = None,
    outlet_id: int | None = None,
    db: Session = Depends(get_db)
):
    """List stock entries with optional filters"""
    
    query = db.query(Stock)
    
    if product_id:
        query = query.filter(Stock.product_id == product_id)
    
    if outlet_id:
        query = query.filter(Stock.outlet_id == outlet_id)
    
    return query.all()


@router.get("/low", response_model=list[LowStockResponse])
def get_low_stock(outlet_id: int | None = None, db: Session = Depends(get_db)):
    """Get all products with stock below minimum threshold"""
    
    query = db.query(Stock)
    
    if outlet_id:
        query = query.filter(Stock.outlet_id == outlet_id)
    
    stock_entries = query.all()
    low_stock_items = []
    
    for stock in stock_entries:
        product = stock.product
        
        if stock.quantity < product.min_stock:
            outlet_name = stock.outlet.name if stock.outlet else "Godown"
            
            low_stock_items.append(LowStockResponse(
                product_id=product.product_id,
                product_name=product.name,
                current_quantity=stock.quantity,
                min_stock=product.min_stock,
                outlet_name=outlet_name
            ))
    
    return low_stock_items


@router.delete("/{stock_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stock_entry(stock_id: int, db: Session = Depends(get_db)):
    """Delete a stock entry"""
    
    db_stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if not db_stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock entry {stock_id} not found"
        )
    
    db.delete(db_stock)
    db.commit()
    
    return None