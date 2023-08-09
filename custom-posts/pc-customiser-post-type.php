<?php
function pc_add_custom_post_type() {
    register_post_type('product_customiser', array(
        'labels' => array(
            'name' => 'Product Customiser',
            'slug' => 'customiser',
            'singular_name' => 'Product Customiser',
            'add_new_item' => 'Add New Product Customiser',
            'edit_item' => 'Edit Product Customiser',
            'all_items' => 'All Product Customisers',
            'view_item' => 'View Product Customiser',
            'search_items' => 'Search Product Customisers',
            'not_found' => 'No Product Customisers Found',
            'not_found_in_trash' => 'No Product Customisers Found in Trash'
        ),
        'public' => true,
        'has_archive' => false,
        'exclude_from_search' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'rest_base' => 'product_customiser',
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-admin-customizer',
        'capability_type' => 'post',
        'supports' => array(
            'title',
            'custom-fields',
        )
    ));
}

function pc_add_meta_box_for_json_config() {
    add_meta_box(
        'pc_json_config',
        'Customiser Configuration',
        'product_customiser_json_config',
        'product_customiser',
    );
};

function pc_register_product_customiser_config() {
    register_post_meta('product_customiser', 'customiser_configuration', array(
        "type" => "string",
        "description" => "The serialised JSON data that stores this configurator",
        "single" => true,
        "show_in_rest" => true,
        )
    );
}

function product_customiser_json_config() {
    global $post_id;
    echo '<div id="customiser-configuration"></div>';
}

function product_customiser_enqueue_scripts($hook_suffix) {
    global $typenow;

    if ($typenow == 'product_customiser') {
        if ($hook_suffix == 'post-new.php' || $hook_suffix == 'post.php') {
            wp_enqueue_script('product-customiser-admin', PC_PLUGIN_DIR . 'build/product-customiser-admin.js', array('jquery', 'wp-element', 'wp-components', 'wp-editor', 'wp-data'), null ,  true);
            wp_enqueue_media();
            $post_id = get_the_ID();
            $meta_value = get_post_meta($post_id, 'customiser_configuration', true);
            wp_enqueue_style('product-customiser-admin', PC_PLUGIN_DIR . 'build/product-customiser-admin.css');
            wp_localize_script('product-customiser-admin', 'initialData', array('data' => $meta_value));
            
        }
    }

    if ($typenow == 'product') {
        if ($hook_suffix == 'post-new.php' || $hook_suffix == 'post.php') {
            wp_enqueue_script('product-settings', PC_PLUGIN_DIR . 'build/product-settings.js', array('jquery', 'wp-element', 'wp-components', 'wp-editor', 'wp-data'), null ,  true);
            wp_enqueue_style('product-settings', PC_PLUGIN_DIR . 'build/product-settings.css');
        }
    }
}

function save_customiser_configuration($post_id) {
    // Check if our custom data is being sent
    if (isset($_POST['customiser_configuration'])) {
        // Sanitize and save the input
        $sanitized_data = sanitize_text_field($_POST['customiser_configuration']);
        update_post_meta($post_id, 'customiser_configuration', $sanitized_data);
    }
}

add_action('save_post_product_customiser', 'save_customiser_configuration');
add_action('init', 'pc_add_custom_post_type');
add_action('init', 'pc_register_product_customiser_config');
add_action('add_meta_boxes', 'pc_add_meta_box_for_json_config');
add_action('admin_enqueue_scripts', 'product_customiser_enqueue_scripts');