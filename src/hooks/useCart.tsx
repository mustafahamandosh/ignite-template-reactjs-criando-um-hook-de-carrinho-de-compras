import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';
import {Product} from '../types';
import {api} from "../services/api";
import {toast} from "react-toastify";

interface CartProviderProps {
    children: ReactNode;
}

interface UpdateProductAmount {
    productId: number;
    amount: number;
}

interface CartContextData {
    cart: Product[];
    addProduct: (productId: number) => Promise<void>;
    removeProduct: (productId: number) => void;
    updateProductAmount: ({productId, amount}: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({children}: CartProviderProps): JSX.Element {
    const prevCartRef = useRef<Product[]>()
    const [cart, setCart] = useState<Product[]>(() => {
        const storageCart = localStorage.getItem('@RocketShoes:cart')

        if (storageCart) {
            return JSON.parse(storageCart);
        }

        return [];
    });

    useEffect(() => {
        prevCartRef.current = cart;
    })

    const cartPrevValue = prevCartRef.current ?? cart;

    useEffect(() => {
        if (cartPrevValue !== cart){
            localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
        }
    }, [cart, cartPrevValue])

    const addProduct = async (productId: number) => {
        try {
            const updatedCart = [...cart];
            const isProductExist = updatedCart.find(({id}) => id === productId)
            const {data} = await api.get(`/stock/${productId}`);
            const productStock = data.amount;
            const currentAmount = isProductExist ? isProductExist.amount : 0;
            const newAmount = currentAmount + 1;

            if (newAmount > productStock) {
                toast.error('Quantidade solicitada fora de estoque');
                return;
            }

            if (isProductExist) {
                isProductExist.amount = newAmount;
            } else {
                const {data} = await api.get(`/products/${productId}`);
                const newProduct = {...data, amount: 1}
                updatedCart.push(newProduct)
            }
            setCart(updatedCart)

        } catch {
            toast.error('Erro na adição do produto')
        }
    };

    const removeProduct = (productId: number) => {
        try {
            const updatedCart = [...cart]
            const productIndex = updatedCart.findIndex(({id}) => id === productId);
            if (productIndex >= 0) {
                updatedCart.splice(productIndex, 1)
                setCart(updatedCart)
            } else {
                throw Error();
            }
        } catch {
            toast.error('Erro na remoção do produto')
        }
    };

    const updateProductAmount = async ({
                                           productId,
                                           amount
                                       }: UpdateProductAmount) => {
        try {
            if (amount <= 0) {
                return;
            }
            const {data} = await api.get(`/stock/${productId}`)
            const stockAmount = data.amount

            if (amount > stockAmount) {
                toast.error('Quantidade solicitada fora de estoque')
                return;
            }

            const updatedCart = [...cart];
            const isProductExist = updatedCart.find(({id}) => id === productId)

            if (isProductExist) {
                isProductExist.amount = amount
                setCart(updatedCart)
            } else {
                throw Error()
            }
        } catch {
            toast.error('Erro na alteração de quantidade do produto')
        }
    };

    return (
        <CartContext.Provider
            value={{cart, addProduct, removeProduct, updateProductAmount}}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart(): CartContextData {
    return useContext(CartContext);
}
