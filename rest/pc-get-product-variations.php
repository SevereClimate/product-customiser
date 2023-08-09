<?php

function get_product_variations($data) {
    $product_id = $data['id'];
    $product = wc_get_product($product_id);
    $variations = $product->get_available_variations();
    $variations_data = array();
    foreach ($variations as $variation) {
        $variation_title = '';
        foreach ($variation['attributes'] as $attribute) {
            $variation_title .= $attribute . ' ';
        }
        $variation_title = trim($variation_title);
        array_push($variations_data, array(
            'id' => $variation['variation_id'],
            'attributes' => $variation['attributes'],
            'title' => $variation_title,
        ));
    }
    return new WP_REST_Response($variations_data, 200);
}

function register_product_variations_route() {
    register_rest_route('product-customiser/v1', '/product-variations/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'get_product_variations',
        'permission_callback' => '__return_true',
    ));
}

add_action('rest_api_init', 'register_product_variations_route');