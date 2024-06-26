WCAG 2.2 Ruleset: https://www.ibm.com/able/requirements/checker-rule-sets/

Kategorien:

- Text Alternatives

  - 1.1.1 (AA)
    // Violation

    - applet_alt_exists
    - img_alt_redundant
    - img_alt_valid
    - area_alt_exists
    - aria_graphic_labelled
    - aria_img_labelled
    - imagebutton_alt_exists
    - imagemap_alt_exists
    - img_alt_decorative
    - img_alt_null
    - object_text_exists

    // Potential Violation

    - img_alt_misuse
    - img_ismap_misuse
    - img_longdesc_misuse
    - media_alt_exists
    - style_background_decorative

    // Recommendation

    - figure_label_exists
    - embed_alt_exists
    - embed_noembed_exists
    - media_alt_brief
    - noembed_content_exists
    - canvas_content_described
    - img_alt_background
    - style_highcontrast_visible

  - 1.2.1 (A)
    // Potential Violation

    - caption_track_exists

    // Recommendation

    - media_audio_transcribed

  - 1.2.2 (A)
    // Potential Violation
    - caption_track_exists
  - 1.2.3 (A)
    // Recommendation
    - media_track_available
  - 1.2.4 (AA)
    // Potential Violation

    - caption_track_exists

    // Recommendation

    - media_live_captioned

  - 1.2.5 (AA)
    // Recommendation
    - media_track_available

- Logical Navigation and Intuitiveness

  - 1.3.2 (A)
    // Violation

    - dir_attribute_valid

    // Potential Violation

    - text_whitespace_valid

  - 1.3.3 (A)
    // Potential Violation
    - text_sensory_misuse
  - 1.3.4 (AA)
    // Violation
    - element_orientation_unlocked
  - 1.4.1 (A)
    // Potential Violation
    - form_font_color
    - style_color_misuse
  - 1.4.12 (AA)
    // Violation
    - text_spacing_valid
  - 1.4.13 (AA)
    // Potential Violation
    - style_hover_persistent
  - 2.2.1 (A)
    // Violation

    - meta_redirect_optional

    // Potential Violation

    - meta_refresh_delay

  - 2.2.2 (A)
    // Violation

    - blink_elem_deprecated
    - marquee_elem_avoid

    // Potential Violation

    - blink_css_review

  - 2.4.1 (A)
    // Violation

    - aria_application_label_unique
    - aria_application_labelled
    - aria_article_label_unique
    - aria_banner_label_unique
    - aria_banner_single
    - aria_complementary_label_unique
    - aria_complementary_labelled
    - aria_contentinfo_label_unique
    - aria_contentinfo_single
    - aria_document_label_unique
    - aria_form_label_unique
    - aria_main_label_unique
    - aria_navigation_label_unique
    - aria_region_label_unique
    - aria_region_labelled
    - aria_search_label_unique
    - skip_main_exists

    // Potential Violation

    - frame_src_valid
    - html_skipnav_exists
    - skip_main_described

    // Recommendation

    - aria_complementary_label_visible
    - aria_content_in_landmark
    - aria_contentinfo_misuse
    - aria_main_label_visible

  - 2.4.2 (A)
    // Violation

    - page_title_exists

    // Potential Violation

    - page_title_valid

  - 2.4.3 (A)
    // Potential Violation
    - widget_tabbable_single
  - 2.4.4 (A)
    // Violation
    - a_text_purpose
  - 2.4.6 (AA)
    // Recommendation
    - heading_content_exists
  - 2.4.7 (AA)
    // Potential Violation
    - element_tabbable_visible
    - script_focus_blur_review
    - style_focus_visible
  - 2.4.11 (AA)
    // Potential Violation
    - element_tabbable_unobscured
  - 3.2.1 (A)
    // Potential Violation
    - script_focus_blur_review
    - script_select_review
  - 3.2.2 (A)
    // Potential Violation

    - form_interaction_review
    - form_submit_button_exists
    - form_submit_review
    - input_onchange_review

    // Recommendation

    - a_target_warning

- Coding Standards

  - 1.3.1 (A)
    // Violation

    - input_checkboxes_grouped
    - table_headers_ref_valid
    - fieldset_label_valid
    - table_scope_valid
    - aria_hidden_nontabbable
    - form_label_unique
    - label_ref_valid
    - table_caption_empty
    - table_caption_nested
    - table_headers_exists
    - table_headers_related
    - table_structure_misuse
    - table_summary_redundant

    // Potential Violation

    - blockquote_cite_exists
    - heading_markup_misuse
    - list_markup_review
    - script_onclick_misuse
    - text_block_heading
    - text_quoted_correctly

    // Recommendation

    - fieldset_legend_valid
    - aria_accessiblename_exists
    - aria_landmark_name_unique
    - input_fields_grouped
    - list_structure_proper
    - script_onclick_avoid
    - select_options_grouped
    - table_layout_linearized

  - 1.3.5 (AA)
    // Violation
    - input_autocomplete_valid
  - 4.1.2 (A)
    // Violation

    - combobox_popup_reference
    - aria_activedescendant_valid
    - combobox_active_descendant
    - aria_role_valid
    - combobox_autocomplete_valid
    - combobox_focusable_elements
    - combobox_haspopup_valid
    - input_label_exists
    - aria_descendant_valid
    - aria_role_allowed
    - a_text_purpose
    - aria_attribute_allowed
    - aria_attribute_conflict
    - aria_attribute_exists
    - aria_attribute_required
    - aria_attribute_value_valid
    - aria_eventhandler_role_valid
    - aria_hidden_nontabbable
    - aria_id_unique
    - aria_parent_required
    - aria_toolbar_label_unique
    - aria_widget_labelled
    - combobox_design_valid
    - frame_title_exists
    - label_content_exists
    - list_children_valid
    - table_aria_descendants

    // Potential Violation

    - input_haspopup_conflict

    // Recommendation

    - aria_child_valid
    - aria_attribute_redundant
    - element_tabbable_role_valid
    - canvas_content_described

- Color Contrast

  - 1.4.3 (AA)
    // Violation
    - text_contrast_sufficient

- Input Assistance

  - 1.4.2 (A)
    // Potential Violation
    - media_autostart_controllable
  - 1.4.4 (AA)
    // Potential Violation

    - style_viewport_resizable

    // Recommendation

    - meta_viewport_zoomable

  - 2.5.3 (A)
    // Violation
    - label_name_visible
  - 2.5.7 (AA)
    // Potential Violation
    - draggable_alternative_exists
  - 2.5.8 (AA)
    // Violation
    - target_spacing_sufficient
  - 3.1.1 (A)
    // Violation
    - html_lang_exists
    - html_lang_valid
  - 3.1.2 (AA)
    // Violation
    - element_lang_valid
  - 3.3.1 (A)
    // Violation
    - error_message_exists
  - 3.3.2 (A)
    // Violation

    - fieldset_label_valid
    - input_label_after
    - input_label_before

    // Potential Violation

    - input_placeholder_label_visible
    - input_label_visible

    // Recommendation

    - element_accesskey_labelled

- Keyboard Operability

  - 2.1.1 (A)
    // Violation

    - aria_activedescendant_tabindex_valid
    - aria_child_tabbable
    - element_scrollable_tabbable
    - iframe_interactive_tabbable

    // Potential Violation

    - application_content_accessible
    - aria_keyboard_handler_exists
    - widget_tabbable_exists
    - widget_tabbable_single
    - media_keyboard_controllable

    // Recommendation

    - element_mouseevent_keyboard

  - 2.1.2 (A)
    // Recommendation
    - download_keyboard_controllable
