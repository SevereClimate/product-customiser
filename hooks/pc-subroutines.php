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
