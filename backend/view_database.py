from app.db.session import SessionLocal
from app.models.product import Product
from app.models.outlet import Outlet
from app.models.stock import Stock
from app.models.offer import Offer
from app.models.invoice import Invoice, InvoiceItem
from app.models.barcode import Barcode

def view_all_data():
    db = SessionLocal()
    
    print("\n" + "="*80)
    print("📊 SPN BILLING SYSTEM DATABASE VIEWER")
    print("="*80)
    
    # View Outlets
    print("\n🏪 OUTLETS:")
    print("-" * 80)
    outlets = db.query(Outlet).all()
    if outlets:
        for outlet in outlets:
            print(f"  ID: {outlet.id} | Name: {outlet.name} | Location: {outlet.location}")
            print(f"    Phone: {outlet.phone} | Manager: {outlet.manager_name}")
            print(f"    Active: {outlet.is_active}")
            print()
    else:
        print("  No outlets found")
    
    # View Products
    print("\n📦 PRODUCTS:")
    print("-" * 80)
    products = db.query(Product).all()
    if products:
        for product in products:
            print(f"  ID: {product.id} | Product ID: {product.product_id}")
            print(f"    Name: {product.name} | Category: {product.category}")
            print(f"    Cost: ₹{product.cost_price} | MRP: ₹{product.mrp} | Selling: ₹{product.selling_price}")
            print(f"    Min Stock: {product.min_stock}")
            print()
    else:
        print("  No products found")
    
    # View Barcodes
    print("\n🔖 BARCODES:")
    print("-" * 80)
    barcodes = db.query(Barcode).all()
    if barcodes:
        for barcode in barcodes:
            product = db.query(Product).filter(Product.id == barcode.product_id).first()
            print(f"  Product: {product.name if product else 'Unknown'}")
            print(f"    Barcode: {barcode.barcode_value} | Format: {barcode.barcode_format}")
            print()
    else:
        print("  No barcodes found")
    
    # View Offers
    print("\n🎁 OFFERS:")
    print("-" * 80)
    offers = db.query(Offer).all()
    if offers:
        for offer in offers:
            product = db.query(Product).filter(Product.id == offer.product_id).first()
            print(f"  Product: {product.name if product else 'Unknown'}")
            print(f"    Type: {offer.offer_type}")
            if offer.offer_type == "BUY_X_GET_Y":
                print(f"    Buy {offer.x_quantity} Get {offer.y_quantity} Free")
            elif offer.offer_type == "PERCENTAGE":
                print(f"    Discount: {offer.discount_percent}%")
            elif offer.offer_type == "FLAT":
                print(f"    Discount: ₹{offer.discount_flat}")
            print(f"    Period: {offer.start_date} to {offer.end_date}")
            print(f"    Active: {offer.is_active}")
            print()
    else:
        print("  No offers found")
    
    # View Stock
    print("\n📊 STOCK:")
    print("-" * 80)
    stocks = db.query(Stock).all()
    if stocks:
        for stock in stocks:
            product = db.query(Product).filter(Product.id == stock.product_id).first()
            outlet = db.query(Outlet).filter(Outlet.id == stock.outlet_id).first() if stock.outlet_id else None
            
            print(f"  Product: {product.name if product else 'Unknown'} ({product.product_id if product else 'N/A'})")
            print(f"    Outlet: {outlet.name if outlet else 'Godown'}")
            print(f"    Quantity: {stock.quantity}")
            if product and stock.quantity < product.min_stock:
                print(f"    ⚠️  LOW STOCK! (Min: {product.min_stock})")
            print()
    else:
        print("  No stock found")
    
    # View Invoices
    print("\n🧾 INVOICES:")
    print("-" * 80)
    invoices = db.query(Invoice).all()
    if invoices:
        for invoice in invoices:
            print(f"  Invoice: {invoice.invoice_number}")
            print(f"    Date: {invoice.created_at}")
            print(f"    Total: ₹{invoice.total_amount} | Discount: ₹{invoice.discount_amount}")
            print(f"    Final Amount: ₹{invoice.final_amount}")
            
            # Invoice Items
            items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
            print(f"    Items:")
            for item in items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                print(f"      - {product.name if product else 'Unknown'} x{item.quantity}")
                print(f"        Unit Price: ₹{item.unit_price} | Discount: ₹{item.discount}")
                print(f"        Line Total: ₹{item.line_total}")
                if item.offer_applied:
                    print(f"        Offer: {item.offer_applied}")
            print()
    else:
        print("  No invoices found")
    
    # Summary
    print("\n" + "="*80)
    print("📈 SUMMARY:")
    print("-" * 80)
    print(f"  Total Outlets: {db.query(Outlet).count()}")
    print(f"  Total Products: {db.query(Product).count()}")
    print(f"  Total Stock Entries: {db.query(Stock).count()}")
    print(f"  Total Offers: {db.query(Offer).count()}")
    print(f"  Total Invoices: {db.query(Invoice).count()}")
    print("="*80 + "\n")
    
    db.close()

if __name__ == "__main__":
    view_all_data()