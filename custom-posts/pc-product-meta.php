<?php

function pc_add_product_customiser_metabox() {
    add_meta_box(
        'pc_product_customiser',
        'Product Customiser',
        'pc_product_customiser_callback',
        'product',
        'side'
    );
}

function pc_register_customiser_meta_for_product() {
    register_post_meta( 'product', 'product_customiser_id', array(
        'type' => 'number',
        'description' => 'The ID of the product customiser to use for this product',
        'single' => true,
        'show_in_rest' => true,
    ));
    register_post_meta( 'product', 'product_customiser_config', array(
        'type' => 'array',
        'description' => 'The configuration for the product customiser',
        'single' => true,
        'show_in_rest' => array(
            'prepare_callback' => function($value) {
                return json_encode($value);
            },
            'schema' => array(
                'type'       => 'array',
                'items'      => array(
                    'type'       => 'object',
                    'properties' => array(
                        'id'     => array(
                            'type' => 'number',
                        ),
                        'title'  => array(
                            'type' => 'string',
                        ),
                        'config' => array(
                            'type'  => 'array',
                            'items' => array(
                                'type'       => 'object',
                                'properties' => array(
                                    'id'          => array(
                                        'type' => 'string',
                                    ),
                                    'title'       => array(
                                        'type' => 'string',
                                    ),
                                    'price'       => array(
                                        'type' => 'number',
                                    ),
                                    'parent'      => array(
                                        'type' => 'string',
                                    ),
                                    'unavailable' => array(
                                        'type' => 'boolean',
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ));
}

function pc_product_customiser_callback($post) {
    $product_customiser_id = get_post_meta($post->ID, 'product_customiser_id', true);
    $saved_configuration = get_post_meta($post->ID, 'product_customiser_config', true);
    $base_configuration = get_post_meta($product_customiser_id, 'customiser_configuration', true);
    $product_type = wc_get_product($post->ID)->get_type();

    $customiser_container = new SimpleXMLElement('<div>Loading...</div>');
    $customiser_container->addAttribute('id', 'product-customiser-settings');
    $customiser_container->addAttribute('data-product-id', $post->ID);
    $customiser_container->addAttribute('data-product-type', $product_type);
    $customiser_container->addAttribute('data-selected-customiser', $product_customiser_id);
    $customiser_container->addAttribute('data-saved-configuration', json_encode( $saved_configuration) );
    $customiser_container->addAttribute('data-base-configuration', json_encode( $base_configuration ) );
    $customiser_container->addAttribute('data-product-title', $post->post_title);

    echo $customiser_container -> asXML();
}
function pc_save_product_customiser($post_id) {
    if (isset($_POST['product_customiser_id'])) {
        update_post_meta($post_id, 'product_customiser_id', intval($_POST['product_customiser_id']));
    }
    if (isset($_POST['product_customiser_config'])) {
        $json_string = stripslashes($_POST['product_customiser_config']);
        $decoded_config = json_decode($json_string, true);

        // Check for JSON errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_die($error_message);
        }
        delete_transient('pc_frontend_configuration_' . $post_id);
        update_post_meta($post_id, 'product_customiser_config', $decoded_config);
    }
}

add_action('add_meta_boxes', 'pc_add_product_customiser_metabox');
add_action('init', 'pc_register_customiser_meta_for_product');
add_action('save_post_product', 'pc_save_product_customiser');