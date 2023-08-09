const { render } = wp.element;
import { ConfigurationProductSettings } from './components/configuration-product-settings.jsx';

import './product-settings.scss';

jQuery(document).ready(($)=>{
    const productSettingsContainer = document.getElementById('product-customiser-settings');
    if (productSettingsContainer) {
        render(<ConfigurationProductSettings loadedData={productSettingsContainer.dataset} />, productSettingsContainer);
    }
});