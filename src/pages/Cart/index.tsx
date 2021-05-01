import React from 'react';
import {
    MdAddCircleOutline,
    MdDelete,
    MdRemoveCircleOutline,
} from 'react-icons/md';

import {Container, ProductTable, Total} from './styles';
import {useCart} from "../../hooks/useCart";
import {formatPrice} from "../../util/format";

const Cart = (): JSX.Element => {
    const {cart, removeProduct, updateProductAmount} = useCart();

    const cartFormatted = cart.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price),
        subTotal: formatPrice(product.price * product.amount)
    }))

    const total = formatPrice(cart.reduce((sumTotal, product) => {
        return sumTotal + (product.price * product.amount)
    }, 0))

    function handleProductIncrement(productId: number, amount: number) {
        updateProductAmount({productId, amount: ++amount})
    }

    function handleProductDecrement(productId: number, amount: number) {
        updateProductAmount({productId, amount: --amount})
    }

    function handleRemoveProduct(productId: number) {
        removeProduct(productId)
    }

    return (
        <Container>
            <ProductTable>
                <thead>
                <tr>
                    <th aria-label="product image"/>
                    <th>PRODUCT</th>
                    <th>QTD</th>
                    <th>SUBTOTAL</th>
                    <th aria-label="delete icon"/>
                </tr>
                </thead>
                <tbody>
                {cartFormatted.map(({
                                        id,
                                        image,
                                        amount,
                                        title,
                                        priceFormatted,
                                        subTotal
                                    }) => (
                    <tr data-testid="product" key={id}>
                        <td>
                            <img src={image} alt={title}/>
                        </td>
                        <td>
                            <strong>{title}</strong>
                            <span>{priceFormatted}</span>
                        </td>
                        <td>
                            <div>
                                <button
                                    type="button"
                                    data-testid="decrement-product"
                                    disabled={amount <= 1}
                                    onClick={() => handleProductDecrement(id, amount)}
                                >
                                    <MdRemoveCircleOutline size={20}/>
                                </button>
                                <input
                                    type="text"
                                    data-testid="product-amount"
                                    readOnly
                                    value={amount}
                                />
                                <button
                                    type="button"
                                    data-testid="increment-product"
                                    onClick={() => handleProductIncrement(id, amount)}
                                >
                                    <MdAddCircleOutline size={20}/>
                                </button>
                            </div>
                        </td>
                        <td>
                            <strong>{subTotal}</strong>
                        </td>
                        <td>
                            <button
                                type="button"
                                data-testid="remove-product"
                                onClick={() => handleRemoveProduct(id)}
                            >
                                <MdDelete size={20}/>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </ProductTable>

            <footer>
                <button type="button">Finalizer pedido</button>

                <Total>
                    <span>TOTAL</span>
                    <strong>{total}</strong>
                </Total>
            </footer>
        </Container>
    );
};

export default Cart;
