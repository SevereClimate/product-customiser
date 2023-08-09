<?php
/**
 * Plugin Name:       Product Customiser
 * Description:       A simple product customiser that allows the user to customise a product
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Jamie Ross
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       product-customiser
 */

 define('PC_PLUGIN_DIR', plugin_dir_path(__FILE__));

include_once('custom-posts/pc-customiser-post-type.php');
include_once('custom-posts/pc-product-meta.php');
include_once('hooks/pc-subroutines.php');
require_once('rest/pc-get-product-variations.php');


