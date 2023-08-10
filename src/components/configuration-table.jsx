const { useState, useEffect } = wp.element;

const ConfigurationRow = ({ config, reportUpdate, level }) => {
    return (
        <tr>
            <td style={{paddingLeft: `${10 + (level * 20)}px`}} className={"option-name" + (config.unavailable ? " option-unavailable" : "")}>
                {config.title}
            </td>
            <td className={"option-price" + (config.unavailable ? " option-unavailable" : "")}>
                <input type="number" min={0} step={1} disabled={config.unavailable} name="price" value={config.price} placeholder="Price" onChange={(e) => reportUpdate(config.id, e.target.getAttribute('name'), parseFloat(e.target.value))} />
            </td>
            <td>
                <label htmlFor={`unavailable-${config.id}`}>
                    <input id={`unavailable-${config.id}`} type="checkbox" name="unavailable" checked={config.unavailable} onChange={(e) => reportUpdate(config.id, e.target.getAttribute('name'), e.target.checked)} />
                    <div className="unavailable-cross"></div>
                </label>
            </td>
        </tr>
    )
}

export const ConfigurationTable = ({ config, handleUpdate }) => {
    const [showingModal, setShowingModal] = useState(false);
    const [selectedProductConfig, setSelectedProductConfig] = useState(0);

    const reportUpdate = (optionId, name, value) => {
        handleUpdate(config[selectedProductConfig].id , optionId, name, value);
    }

    const renderRows = (parentId, level=0) => {

        return config[selectedProductConfig].config.filter(option => option.parent === parentId).map((option) => {
                    return (
                        <>
                            <ConfigurationRow config={option} reportUpdate={reportUpdate} key={selectedProductConfig + '-' + option.id} level={level}/>
                            {renderRows(option.id, level + 1)}
                        </>
                    )
            });
    };
        return ( 
            <>
                <dialog id="configuration-table-modal" onClick={(e)=>(e.stopPropagation())}>
                    <h1>Configure Pricing</h1>
                    {config.length > 1 && <h2>Product Variant</h2>}
                        {config.length > 1 && 
                        <select id="selected-product-id" 
                                name="selected_product_id" 
                                value={selectedProductConfig} 
                                onChange={(e) => {
                                    setSelectedProductConfig(parseInt(e.target.value))
                            }}>
                        {config.map((product, index) => <option value={index}>{product.title}</option>)}
                        </select>}
                    <table className="configuration-table">
                        <thead>
                            <tr>
                                <th>Option Name</th>
                                <th>Price</th>
                                <th>Unavailable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {config.length > 0 && renderRows(config[selectedProductConfig].config.find(option => option.parent === null).id)}
                        </tbody>
                    </table>
                    <div style={{marginTop: "15px"}} className="button button-primary" id="save-config" onClick={()=>{document.querySelector('#configuration-table-modal').close()}}>Close Window</div>
                </dialog>
                <div className="button button-primary" onClick={()=>{document.querySelector('#configuration-table-modal').showModal()}}>Configure Pricing</div>
            </>
        )
    };