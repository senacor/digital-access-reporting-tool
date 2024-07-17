import { RuleIdsByCategory } from "./types"

export const levelAARuleIdsByCategory: RuleIdsByCategory = {
  textAlternatives: new Set([
    /* 1.1.1 */
    // Violation
    "applet_alt_exists",
    "img_alt_redundant",
    "img_alt_valid",
    "area_alt_exists",
    "aria_graphic_labelled",
    "aria_img_labelled",
    "imagebutton_alt_exists",
    "imagemap_alt_exists",
    "img_alt_decorative",
    "img_alt_null",
    "object_text_exists",
    // Potential Violation
    "img_alt_misuse",
    "img_ismap_misuse",
    "img_longdesc_misuse",
    "media_alt_exists",
    "style_background_decorative",
    // Recommendation
    "figure_label_exists",
    "embed_alt_exists",
    "embed_noembed_exists",
    "media_alt_brief",
    "noembed_content_exists",
    "canvas_content_described",
    "img_alt_background",
    "style_highcontrast_visible",

    /* 1.2.4 */
    // Potential Violation
    "caption_track_exists",
    // Recommendation
    "media_live_captioned",

    /* 1.2.5 */
    // Recommendation
    "media_track_available",
  ]),
  logicalNavigationAndIntuitiveness: new Set([
    /* 1.3.4 */
    // Violation
    "element_orientation_unlocked",
    /* 1.4.12 */
    // Violation
    "text_spacing_valid",
    /* 1.4.13 */
    // Potential Violation
    "style_hover_persistent",

    /* 2.4.6 */
    // Recommendation
    "heading_content_exists",

    /* 2.4.7 */
    // Potential Violation
    "element_tabbable_visible",
    "script_focus_blur_review",
    "style_focus_visible",

    /* 2.4.11 */
    // Potential Violation
    "element_tabbable_unobscured",
  ]),
  codingStandards: new Set([
    /* 1.3.5 */
    // Violation
    "input_autocomplete_valid",
  ]),
  colorContrast: new Set([
    /* 1.4.3 */
    // Violation
    "text_contrast_sufficient",
  ]),
  inputAssistance: new Set([
    /* 1.4.4 */
    // Potential Violation
    "style_viewport_resizable",
    // Recommendation
    "meta_viewport_zoomable",

    /* 2.5.7 */
    // Potential Violation
    "draggable_alternative_exists",

    /* 2.5.8 */
    // Violation
    "target_spacing_sufficient",

    /* 3.1.2 */
    // Violation
    "element_lang_valid",
  ]),
  keyboardOperability: new Set(),
}
