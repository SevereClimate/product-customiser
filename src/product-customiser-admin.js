const { useState, useEffect, render } = wp.element;
import {v4 as uuid } from 'uuid';
import { ConfigurationLayer } from './components/configuration-layer';

import './product-customiser-admin.scss';

class layerTemplate {
    constructor(parentId) {
        this.id = uuid();
        this.title = "";
        this.message = "";
        this.description = "";
        this.image = null;
        this.parent = parentId;
    }
}

const CustomiserConfiguration = () => {

    let loadedData = document.getElementById('customiser-configuration').dataset.configurationData
    console.log(loadedData)

    try {
        if (typeof loadedData == "string" && loadedData.length > 0){
            loadedData = JSON.parse(loadedData);
        } else {
            loadedData = null;
        }
    } catch(e) {
        console.error("Error parsing initial data", e)
    }

    const [configurationData, setConfigurationData] = useState(loadedData || [new layerTemplate(null)] );

    //Serialize and submit the updated data when the post is saved
    jQuery(document).ready(function($){
        $('#post').on('submit', function() {
            let serialisedData = JSON.stringify(configurationData);

            let input = $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'customiser_configuration').val(serialisedData);   
                     
            $(this).append($(input));
        })
    });

    const renderTopLayer = () => {
        return <ConfigurationLayer className="configuration-layer" config={configurationData[0]} reportUpdate={handleUpdate} key={configurationData[0].id} addOption={addLayer} allLayers={configurationData} deleteLayer={removeLayerAndChildren}/>
    }

    const addLayer = (parentId) => {
        const updatedData = [...configurationData, new layerTemplate(parentId)]
        setConfigurationData(updatedData);
    }

    const removeLayerAndChildren = (layerId) => {
        const updatedData = configurationData.filter((layer)=>{
            if (layer.id == layerId){
                return false;
            } else if (layer.parent == layerId){
                removeLayerAndChildren(layer.id);
                return false;
            } else {
                return true;
            }
        });

        setConfigurationData(updatedData);
    }

    const handleUpdate = (id, key, value) => {
        const updatedData = configurationData.map((layer)=>{
            if (layer.id == id){
                const updatedLayer = {...layer}
                updatedLayer[key] = value;
                return updatedLayer;
            } else {
                return layer;
            }
        });

        setConfigurationData(updatedData);
    }
    
    return (
        <div className="configuration">
            <h1>Customiser Configuration</h1>
            <div id="top-layer">
               {!configurationData && "Loading..."}
               {configurationData && renderTopLayer()}
            </div>
        </div>
    );
}

render(<CustomiserConfiguration />, document.getElementById('customiser-configuration'));
