const { useEffect, useState } = wp.element;
import { ConfigurationTable } from './configuration-table.jsx';

export const ConfigurationProductSettings = ({ loadedData }) => {

    const [selectedCustomiserId, setSelectedCustomiserId] = useState(parseInt(loadedData.selectedCustomiser));
    const [customisers, setCustomisers] = useState([]);
    const [savedConfiguration, setSavedConfiguration] = useState([]);
    const [baseConfiguration, setBaseConfiguration] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const productType = loadedData.productType;

    useEffect(() => {
        fetch("/wp-json/wp/v2/product_customiser")
            .then(response => response.json())
            .then(data => {
                setCustomisers(data);
            })
            .catch(error => console.error("Error:", error));

        fetch(`/wp-json/wp/v2/product/${loadedData.productId}`)
        .then(response => response.json()).then(data => {
            console.log(data);
            if (data.meta.product_customiser_config == null) {
                handleCustomiserChange(loadedData.selectedCustomiser);
            } else {
                setSavedConfiguration(JSON.parse(data.meta.product_customiser_config));
            }
        })
        .catch(error => console.error("Error:", error));
        if (loadedData.selectedCustomiser != 0) {
            fetch(`/wp-json/wp/v2/product_customiser/${loadedData.selectedCustomiser}`)
            .then(response => response.json()).then(data => {
                setBaseConfiguration(data.meta.customiser_configuration);
            });
        }
    }, []);

    const handleCustomiserChange = async (id) => {
        //present a confirmation dialog to allow the user to cancel if they don't want to reset the configuration
        
        let answer = confirm(`Are you sure you want to change the product customiser?\n\nThis will reset the configuration for this product, however changes are not final until the product is saved.`)
       
        if (!answer) {return};
        const loadingDialog = document.querySelector("#loading-dialog");
        loadingDialog.showModal();
        try {
            if (id == selectedCustomiserId) return;
            if (id == 0 || id == "") {
                setSelectedCustomiserId(0);
                setSavedConfiguration([]);
                setBaseConfiguration([]);
                return;
            }
            setSelectedCustomiserId(parseInt(id));
            const response = await fetch(`/wp-json/wp/v2/product_customiser/${id}`);
            const data = await response.json();
            const parsedData = JSON.parse(data.meta.customiser_configuration);
            setBaseConfiguration(parsedData);
            if (productType == "simple") {
                let newSavedConfiguration = [{
                    id: loadedData.productId,
                    title: loadedData.productTitle,
                    config: parsedData.map((option) => {
                        return ({
                            id: option.id,
                            title: option.title,
                            price: null,
                            unavailable: false,
                            parent: option.parent
                        })
                    })
                }];
                setSavedConfiguration(newSavedConfiguration);
            } else {
                const childProducts = await jQuery.ajax(`/wp-json/product-customiser/v1/product-variations/${loadedData.productId}`, {
                    success: (data) => {
                        return data;
                    }
                })
                let newSavedConfiguration = [];
                for (let childProduct of childProducts){
                    newSavedConfiguration.push(
                        { id: childProduct.id,
                          title: childProduct.title,
                          config: parsedData.map((option) => {
                            return ({
                                id: option.id,
                                title: option.title,
                                price: null,
                                unavailable: false,
                                parent: option.parent
                            })
                        })
                    });
                }
                setSavedConfiguration(newSavedConfiguration);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            loadingDialog.close();
        }
    };
    

    const handleUpdate = (productId, optionId, name, value) => {
        const changedProductConfig = savedConfiguration.find(product => product.id == productId).config;
        if (name == "unavailable") {
            propagateCheckbox(changedProductConfig, optionId, value);
        }
        let changedOption = changedProductConfig.find(option => option.id == optionId);
        changedOption[name] = value;
        const newConfig = savedConfiguration.map(product => {
            if (product.id == productId) {
                return ({
                    id: product.id,
                    title: product.title,
                    config: changedProductConfig
                })
            } else {
                return product;
            }
        });
        setSavedConfiguration(newConfig);
    }

    function propagateCheckbox(config, parentId, value) {
        const childIndexes = config.filter(option => option.parent == parentId).map(option => config.findIndex(child => child.id == option.id));
        childIndexes.forEach(index => {
                config[index].unavailable = value;
                propagateCheckbox(config, config[index].id, value);
        });
    }

    document.querySelector("#post").addEventListener('submit', () => {
        document.querySelector('input[name="product_customiser_config"]').value = JSON.stringify(savedConfiguration);
    });

        return (
            <>
                <select id="product-customiser-id" name="product_customiser_id" value={selectedCustomiserId} onChange={(e) => handleCustomiserChange(e.target.value)}>
                    <option value="0" >-Select a Product Customiser-</option>
                    {customisers.map(customiser => <option value={customiser.id}>{customiser.title.rendered}</option>)}
                </select>
                {(savedConfiguration != null && selectedCustomiserId != 0) && <ConfigurationTable handleUpdate={handleUpdate} config={savedConfiguration} />}
                <input type="hidden" name="product_customiser_config" value="" />
                <dialog id="loading-dialog"><div class="loader"></div><h1>Loading Product Customiser...</h1></dialog>
            </>
        )
    }