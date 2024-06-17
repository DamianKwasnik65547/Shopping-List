from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shopping_list.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    comment = db.Column(db.String(200), nullable=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id, 
        'name': p.name, 
        'quantity': p.quantity, 
        'price': p.price, 
        'comment': p.comment if p.comment else '-'
    } for p in products])

@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    new_product = Product(
        name=data['name'], 
        quantity=data['quantity'], 
        price=data['price'], 
        comment=data.get('comment', '-')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully'}), 201

@app.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'})

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.get_json()
    product = Product.query.get(id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    product.name = data['name']
    product.quantity = data['quantity']
    product.price = data['price']
    product.comment = data.get('comment', product.comment)
    db.session.commit()
    return jsonify({'message': 'Product updated successfully'})

if __name__ == '__main__':
    app.run(debug=True)
