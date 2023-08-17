<?php

function pc_return_product_customiser_id($product_id) {
    $customiser_id = get_post_meta($product_id, 'product_customiser_id', true);
    return $customiser_id;
}

function pc_return_product_customiser_saved_configuration($product_id) {
    $saved_configuration = get_post_meta($product_id, 'product_customiser_config', true);
    return $saved_configuration;
}

function pc_return_product_customiser_base_configuration($customiser_id) {
    $base_configuration = get_post_meta($customiser_id, 'customiser_configuration', true);
    return $base_configuration;
}

function pc_return_base_configuration_title($customiser_id) {
    $base_configuration_title = get_the_title($customiser_id);
    return $base_configuration_title;
}

function pc_return_frontend_configuration($saved_configuration, $base_configuration, $base_configuration_title) {
    
    global $product;

    $frontend_configuration = get_transient('pc_frontend_configuration_' . $product->get_id());

    if ($frontend_configuration == false){
        
        $product_type = $product->get_type();
        $frontend_configuration = array();
        foreach($saved_configuration as $saved_configuration_product){
            if ($product_type == 'variable'){
                $base_price = wc_get_product($saved_configuration_product["id"])->get_price();
            } else if ($product_type == 'simple'){
                $base_price = $product->get_price();
            } else {
                wp_die('Product Customiser: Product type not supported');
            }
            $new_frontend_product = array(
                'id' => $saved_configuration_product["id"],
                'title' => $saved_configuration_product["title"],
                'base_price' => $base_price,
                'config' => array()
            ); 
            foreach($saved_configuration_product["config"] as $product_configuration){
                $matching_base_configuration = $base_configuration[array_search($product_configuration["id"], array_column($base_configuration, 'id'))];

                $new_frontend_product["config"][] = array(
                    'id' => $product_configuration["id"],
                    'title' => $matching_base_configuration->title,
                    'price' => $product_configuration["price"],
                    'parent' => $matching_base_configuration->parent,
                    'unavailable' => $product_configuration["unavailable"],
                    'image' => $matching_base_configuration->image,
                    'imageId' => $matching_base_configuration->imageId ?? null,
                    'imageThumbnail' => isset($matching_base_configuration->imageId) ? wp_get_attachment_image_src($matching_base_configuration->imageId, 'thumbnail')[0] : null,
                    'description' => $matching_base_configuration->description,
                    'message' => $matching_base_configuration->message
                );
            }
            $frontend_configuration["products"][] = $new_frontend_product;
            $frontend_configuration["title"] = $base_configuration_title;
        }
        set_transient('pc_frontend_configuration_' . $product->get_id(), $frontend_configuration, 60 * 60 * 24 * 7);
    }
    return $frontend_configuration;
}

function pc_localize_frontend_configuration(){
    global $product;
    $product_id = $product->get_id();
    $customiser_id = pc_return_product_customiser_id($product_id);
    $saved_configuration = pc_return_product_customiser_saved_configuration($product_id);
    $base_configuration = pc_return_product_customiser_base_configuration($customiser_id);
    $base_configuration_title = pc_return_base_configuration_title($customiser_id);
    $frontend_configuration = pc_return_frontend_configuration($saved_configuration, $base_configuration, $base_configuration_title);

    //json encode this and pass it to the frontend using localize script
    wp_localize_script('product-customiser-frontend', 'customiserFrontEnd', $frontend_configuration);
    
    return;
}

function pc_output_frontend_container(){
    echo '<div id="product-customiser-frontend-container"></div>';
}

function pc_place_frontend_container(){
    global $product;
    if ($product->get_type() == 'variable'){
        add_action('woocommerce_after_variations_table', 'pc_output_frontend_container', 1);
    } else if ($product->get_type() == 'simple'){
        add_action('woocommerce_before_add_to_cart_form', 'pc_output_frontend_container', 1);
    } else {
        wp_die('Product Customiser: Product type not supported');
    }
}

//hook into the woocommerce product page to localize the frontend configuration
add_action('woocommerce_before_single_product', 'pc_localize_frontend_configuration', 1);
add_action('woocommerce_before_single_product', 'pc_place_frontend_container', 1);

add_action( 'wp_enqueue_scripts', 'pc_load_dashicons_front_end' );
function pc_load_dashicons_front_end() {
  wp_enqueue_style( 'dashicons' );
}

