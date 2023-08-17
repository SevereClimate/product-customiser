<?php

function pc_clean_up_associated_products($customiser_id) {
    $products = get_posts(array(
        'post_type' => 'product',
        'meta_query' => array(
            array(
                'key' => 'product_customiser_id',
                'value' => $customiser_id,
            ),
        ),
    ));
    foreach($products as $product) {
        delete_transient('pc_frontend_configuration_' . $product->get_ID());
        delete_post_meta($product->ID, 'product_customiser_id');
        delete_post_meta($product->ID, 'product_customiser_config');
    }
}

function pc_add_trash_customiser_hook($post_id){
    $post_type = get_post_type($post_id);
    
    if ($post_type != 'product_customiser') return;

    do_action('pc_trash_customiser', $post_id);
}

add_action('wp_trash_post', 'pc_add_trash_customiser_hook');
add_action('pc_trash_customiser', 'pc_clean_up_associated_products');

function pc_update_saved_configuration($saved_configuration, $base_configuration) {
    // @params
    // $saved_configuration: array of saved configuration option objects
    // $base_configuration: array of base configuration option objects

    // @return
    // $saved_configuration: array of saved configuration option objects with redundant options removed and new options added

    $new_saved_configuration = array();

    foreach($base_configuration as $base_option){
        $found = false;
        foreach($saved_configuration as $saved_option){
            if($saved_option["id"] == $base_option -> id ){
                $found = true;
                $new_option = array(
                    'id' => $base_option->id,
                    'title' => $base_option->title,
                    'price' => $saved_option["price"],
                    'parent' => $base_option->parent,
                    'unavailable' => $saved_option["unavailable"]
                );
                array_push($new_saved_configuration, $new_option);
            }
        }
        if(!$found){
            $new_option = array(
                'id' => $base_option->id,
                'title' => $base_option->title,
                'price' => null,
                'parent' => $base_option->parent,
                'unavailable' => false
            );
            array_push($new_saved_configuration, $new_option);
        }
    }

    return $new_saved_configuration;

}

function pc_retrieve_linked_products($customiser_id) {
    // @params
    // $customiser_id: the id of the customiser to retrieve linked products for
    // @return
    // $linked_product_ids: array of linked product ids

    $linked_products = get_posts(array(
        'post_type' => 'product',
        'meta_query' => array(
            array(
                'key' => 'product_customiser_id',
                'value' => $customiser_id,
            ),
        ),
    ));

    $linked_product_ids = array_map(function($product){
        return $product->ID;
    }, $linked_products);

    return $linked_product_ids;

}

function pc_update_linked_product_configurations($linked_product_ids, $base_configuration_id){
    // @params
    // $linked_product_ids: array of linked product ids
    // @return
    // null
    $base_configuration = get_post_meta($base_configuration_id, 'customiser_configuration', true);

    foreach($linked_product_ids as $product_id){
        $product_customiser_config_products = get_post_meta($product_id, 'product_customiser_config', true);
        $updated_product_customiser_config_products = array();
        foreach($product_customiser_config_products as $product_customiser_config_product){
            $updated_product_customiser_config = pc_update_saved_configuration($product_customiser_config_product["config"], $base_configuration);
            $replacement_product = array(
                'id' => $product_customiser_config_product["id"],
                'title' => $product_customiser_config_product["title"],
                'config' => $updated_product_customiser_config
            );
            delete_transient('pc_frontend_configuration_' . $product_id);
            array_push($updated_product_customiser_config_products, $replacement_product);
        }
        
        update_post_meta($product_id, 'product_customiser_config', $updated_product_customiser_config_products);
    }

}

function pc_handle_customiser_update($base_configuration_id){
    // @params
    // $customiser_id: the id of the customiser that has been updated
    // @return
    // null
    if (get_post_type($base_configuration_id) != 'product_customiser') return;
    $linked_product_ids = pc_retrieve_linked_products($base_configuration_id);
    pc_update_linked_product_configurations($linked_product_ids, $base_configuration_id);

}

add_action('save_post_product_customiser', 'pc_handle_customiser_update');