const { useState, useEffect } = wp.element;
const { media } = wp;
import { v4 as uuid } from 'uuid';

export const ConfigurationLayer = ({ config, reportUpdate, addOption, allLayers, deleteLayer }) => {

    const optionCount = allLayers.filter(layer => layer.parent == config.id).length;
    const hasChildren = optionCount > 0;
    const [showChildren, setShowChildren] = useState(true);

    const handleUpdate = (e) => {
        reportUpdate(config.id, e.target.getAttribute('name'), e.target.value);
    }

    const renderChildren = () => {
        return (
            <div className="options-body">
            {allLayers.filter(layer => layer.parent == config.id).map(layer => <ConfigurationLayer config={layer} reportUpdate={reportUpdate} key={layer.id} addOption={addOption} allLayers={allLayers} deleteLayer={deleteLayer}/>)}
            </div>
        )
    }

    const selectImage = (e) => {
        const image = wp.media({
            title: 'Select Image',
            multiple: false
        }).open().on('select', () => {
            const uploadedImage = image.state().get('selection').first();
            const imageSrc = uploadedImage.toJSON().url;
            reportUpdate(config.id, 'image', imageSrc);
        }
        );
    }

    const addLayer = () => {
        addOption(config.id);
        setShowChildren(true);
    }


    return (
        <div className={`configuration-layer`}>
            <div className="layer-settings">
                <div className="display-settings">
                        <input type="text" name="title" value={config.title} placeholder="Option Name" onChange={(e) => handleUpdate(e)} />
                    {hasChildren && 
                        <input type="text" name="message" value={config.message} title="The message to be displayed to the user" placeholder={`Choose a${config.title ? " " + config.title: "n"} option${!config.message ? ' (default)' : ''}`} onChange={(e) => handleUpdate(e)} />
                    }
                </div>
                <div className="image-picker">
                    {config.image && <img title="Replace image" src={config.image} onClick={selectImage} />}
                    {!config.image && <div title="Add image" className="image-button" onClick={selectImage}><div className="dashicons dashicons-format-image"></div></div>}
                </div>
                <div className="description">
                        <textarea name="description" value={config.description} placeholder={`Description for ${config.title || 'this option'}. `} onChange={(e) => handleUpdate(e)} />
                </div>
                <div className="add-option" title="Add option" onClick={addLayer}>
                    <div className="dashicons dashicons-plus"></div>
                </div>
                {config.parent && <div className="delete-layer" title="Delete this option and sub-options" onClick={()=>{deleteLayer(config.id)}}>
                    <div className="dashicons dashicons-no"></div>    
                </div>}
            </div>
            {hasChildren &&
                <div className="options" style={{marginLeft: config.parent ? "20px" : "0px"}}>
                    <div title={`${showChildren ? "Hide" : "Show"} ${optionCount} option${optionCount == 1 ? '' : 's'}`} onClick={()=>{setShowChildren(!showChildren)}} className="options-header"> 
                        <span className={`dashicons dashicons-arrow-${showChildren ? 'down' : 'right'}`}></span>
                        <div className="options-title">{config.title && config.title + " "}Options</div>
                    </div>
                    {showChildren &&
                        renderChildren()
                    }
                </div>
            }
        </div>
    )
}