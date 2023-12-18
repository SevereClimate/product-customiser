import { useState, useEffect, createRoot } from '@wordpress/element';
import './product-customiser-frontend.scss';

const ProductCustomiserFrontend = ({ configuration }) => {
    const [selectedProductID, setSelectedProductID] = useState(0);

    useEffect(() => {
        const isVariableProduct = jQuery('.single_variation_wrap').length > 0;

        if (isVariableProduct) {
            const handleShowVariation = (event, variation) => {
                const productId = parseInt(jQuery('input[name="variation_id"]').val());
                setSelectedProductID(productId ? productId : 0);
            };
            jQuery('.variations_form').on('wc_variation_form', handleShowVariation);
            jQuery('.variations_form').on('woocommerce_variation_has_changed', handleShowVariation);
            return () => {
                jQuery('.variations_form').off('woocommerce_variation_has_changed', handleShowVariation);
            };
        } else {
            const productId = jQuery('button[name="add-to-cart"]').val();
            setSelectedProductID(productId);
        }
    }, []);

    return (
        <>
            {selectedProductID != 0 && <ProductCustomiserForm selectedProduct={configuration.products.find(a => a.id === selectedProductID)} />}
        </>
    );
};

const ProductCustomiserForm = ({ selectedProduct }) => {
    const [focusedOption, setFocusedOption] = useState(null);
    const [children, setChildren] = useState([]);
    const [chosenOption, setChosenOption] = useState("");

    const returnOptionPrice = (option, selectedProduct) => {
        console.log("product coming out", selectedProduct)
        if (option.price) {
            return option.price;
        } else if (option.parent) {
            const parentOption = selectedProduct.config.find(a => a.id === option.parent);
            return parseFloat(returnOptionPrice(parentOption, selectedProduct));
        } else {
            return parseFloat(selectedProduct.base_price)
        }
    };

    useEffect(() => {
        const rootOption = selectedProduct.config.find(a => a.parent === null);
        setFocusedOption(rootOption);
        setChildren(selectedProduct.config.filter(a => a.parent == rootOption.id));
    }, []);
    

    const handleOptionClick = (option) => {
        const optionChildren = selectedProduct.config.filter(a => a.parent == option.id);
        if (optionChildren.length == 0) {
            setChosenOption(option);
            document.querySelector('.price .woocommerce-Price-amount').innerHTML = `£${returnOptionPrice(option, selectedProduct).toLocaleString()}`;
            document.querySelector('input[name="pc_chosen_option"]').value = option.id;
            return;
        }
        setFocusedOption(option);
        setChildren(optionChildren);
    };

    const returnChosenOptionFullTitle = (option, selectedProduct) => {
        let currentOption = option;
        let title = currentOption.title
        while (currentOption.parent) {
            currentOption = selectedProduct.config.find(a => a.id === currentOption.parent);
            title = `${currentOption.title} - ${title}`;
        }
        return title;
    }

    const renderChildren = () => {
        return children.map((child, index) => {
            return <div style={{"--animation-order": index}} key={child.id} title={child.description} disabled={child.unavailable} className={`pc-option ${chosenOption == child.id ? "chosen-option" : ""}`} onClick={() => {handleOptionClick(child)}}>
                    <div className={child.image ? "title" : "title text-only"}>{child.title}</div>
                    <div className="selected-icon dashicons dashicons-yes"></div>
                    <div className={child.image ? "price" : "price text-only"}>£{returnOptionPrice(child, selectedProduct).toLocaleString()}</div>
                    {child.image && <img alt={child.title} src={child.imageThumbnail} />}
                </div>;
        });
    };  

    return (
            <div className="pc-frontend">
                <div className= "pc-header-bar">
                    <div className={`dashicons dashicons-arrow-left-alt2 ${!focusedOption?.parent && "hide-icon"}`} onClick={() => {handleOptionClick(selectedProduct.config.find(a => a.id === focusedOption.parent))}}></div>
                    {focusedOption && <h1 key={Math.random()}>{focusedOption.title}</h1>}
                </div>
                {chosenOption && <div className="pc-chosen-option"><strong>Selected: {returnChosenOptionFullTitle(chosenOption, selectedProduct)}</strong> - £{returnOptionPrice(chosenOption, selectedProduct)}</div>}
                <div className="pc-focussed-options">
                    {renderChildren()}
                </div>
                <p>{focusedOption && focusedOption.description}</p>
            </div>
    );
};

const container = createRoot(document.getElementById('product-customiser-frontend-container'));

jQuery(document).ready(function ($) {

    if (container) {
        container.render(<ProductCustomiserFrontend configuration={window.customiserFrontEnd} />);
        for (let product of window.customiserFrontEnd.products){
            for (let config of product.config){
                if (config.imageThumbnail) {
                    new Image().src = config.imageThumbnail 
                }
            }
        }
    }
});
