#include <tizen.h>
#include <storage.h>
#include <curl/curl.h>
#include <libxml/parser.h>
#include "main.h"

static xmlDocPtr doc = NULL;

static int
writer(char *data, size_t size, size_t nmemb, void *user_data)
{
	doc = xmlReadMemory(data, size * nmemb, NULL, NULL, 0);
	return size * nmemb;
}

static bool
storage_cb(int storage_id, storage_type_e type, storage_state_e state, const char *path, void *user_data)
{
   if (type == STORAGE_TYPE_INTERNAL)
   {
      *((int *)user_data) = storage_id;
      return false;
   }
   return true;
}

static bool
exist_file()
{
	int error, internal_storage_id;
	char *dir, path[PATH_MAX] = {0,};
	struct stat buffer;

	error = storage_foreach_device_supported(storage_cb, &internal_storage_id);
	if (error) return false;
	storage_get_directory(internal_storage_id, STORAGE_DIRECTORY_DOCUMENTS, &dir);
	strcat(path, dir);
	strcat(path, "/TPO_files/TPO_favorite.tpo");
	free(dir);

	/* file is not exist */
	if (stat(path, &buffer) != 0) return false;
	return true;
}

static void
app_get_resource(const char *edj_file_in, char *edj_path_out, int edj_path_max)
{
	char *res_path = app_get_resource_path();
	if (res_path) {
		snprintf(edj_path_out, edj_path_max, "%s%s", res_path, edj_file_in);
		free(res_path);
	}
}

static void
create_popup(Evas_Object *parent, char* text) {
	Evas_Object *popup;

	popup = elm_popup_add(parent);
	elm_object_style_set(popup, "toast");
	elm_popup_orient_set(popup, ELM_POPUP_ORIENT_BOTTOM);
	evas_object_size_hint_weight_set(popup, EVAS_HINT_EXPAND, EVAS_HINT_EXPAND);
	elm_popup_align_set(popup, ELM_NOTIFY_ALIGN_FILL, 1.0);
	elm_object_part_text_set(popup, "elm.text", text);
	elm_popup_timeout_set(popup, 3.0);
	evas_object_smart_callback_add(popup, "timeout", eext_popup_back_cb, NULL);
	evas_object_smart_callback_add(popup, "block,clicked", eext_popup_back_cb, parent);
	eext_object_event_callback_add(popup, EEXT_CALLBACK_BACK, eext_popup_back_cb, parent);
	evas_object_show(popup);
}

static void
_button_clicked_cb(void *data, Evas_Object *obj, void *event_info)
{
	widget_instance_data_s *wid = data;
	app_control_h app_control;
	if (app_control_create(&app_control)== APP_CONTROL_ERROR_NONE)
	{
	//Setting an app ID.
	    if (app_control_set_app_id(app_control, "Jlkedqbso8.TPO") == APP_CONTROL_ERROR_NONE)
	    {
	    	app_control_set_operation(app_control, APP_CONTROL_OPERATION_VIEW);
	    	app_control_set_uri(app_control, "http://yourdomain/TPO");
	    	app_control_error_e err = app_control_send_launch_request(app_control, NULL, NULL);
	    	if (err == APP_CONTROL_ERROR_INVALID_PARAMETER) {
	    		create_popup(wid->win, "INVALID PARAMETER");
	    	} else if (err == APP_CONTROL_ERROR_OUT_OF_MEMORY) {
	    		create_popup(wid->win, "OUT OF MEMORY");
	    	} else if (err == APP_CONTROL_ERROR_APP_NOT_FOUND) {
	    		create_popup(wid->win, "NOT FOUND");
	    	} else if (err == APP_CONTROL_ERROR_KEY_NOT_FOUND ) {
	    		create_popup(wid->win, "KEY NOT FOUND");
	    	} else if (err == APP_CONTROL_ERROR_KEY_REJECTED ) {
	    		create_popup(wid->win, "KEY REJECTED");
	    	} else if (err == APP_CONTROL_ERROR_INVALID_DATA_TYPE ) {
	    		create_popup(wid->win, "INVALID DATA TYPE");
	    	} else if (err == APP_CONTROL_ERROR_LAUNCH_REJECTED ) {
	    		create_popup(wid->win, "LAUNCH REJECTED");
	    	} else if (err == APP_CONTROL_ERROR_PERMISSION_DENIED ) {
	    		create_popup(wid->win, "PERMISSION DENIED");
	    	} else if (err == APP_CONTROL_ERROR_LAUNCH_FAILED ) {
	    		create_popup(wid->win, "FAILED");
	    	} else if (err == APP_CONTROL_ERROR_TIMED_OUT ) {
	    		create_popup(wid->win, "TIMED OUT");
	    	}
	    }
	    if (app_control_destroy(app_control) == APP_CONTROL_ERROR_NONE)
	    {

	    }
	}
}

static void
read_file(int station_index, int bus_index, int *station_number, int *bus_number)
{
	int error, internal_storage_id;
	int i, j, count;
	char *dir, path[PATH_MAX] = {0,}, buf[1024];
	FILE *f;

	error = storage_foreach_device_supported(storage_cb, &internal_storage_id);
	if (error) return;
	storage_get_directory(internal_storage_id, STORAGE_DIRECTORY_DOCUMENTS, &dir);
	if (!exist_file()) return;
	strcat(path, dir);
	strcat(path, "/TPO_files/TPO_favorite.tpo");
	free(dir);

	f = fopen(path, "r");
	for (i = 0; i < station_index; i++)
	{
		fgets(buf, 1024, f);
	}
	fscanf(f, "%d ", station_number);
	fscanf(f, "%d", &count);
	if (bus_index >= count) {
		*bus_number = -1;
		return;
	}
	for (i = 0; i < bus_index; i++)
	{
		fscanf(f, " %d", &j);
	}
	fscanf(f, " %d", bus_number);
	fclose(f);
}

static void
get_arrival_time(int station_number, int bus_number)
{
	CURL *curl;
	CURLcode res;

	/* Get a curl handle */
	curl = curl_easy_init();
	if (curl)
	{
		/* Set restful API URL */
		curl_easy_setopt(curl, CURLOPT_URL, "");
		curl_easy_setopt(curl, CURLOPT_HTTPGET, 1);
		curl_easy_setopt(curl,CURLOPT_WRITEFUNCTION, writer);
		res = curl_easy_perform(curl);
		if (CURLE_OK == res)
		{

		}
		curl_easy_cleanup(curl);
	}

}

static int
widget_instance_create(widget_context_h context, bundle *content, int w, int h, void *user_data)
{
	widget_instance_data_s *wid = (widget_instance_data_s*) malloc(sizeof(widget_instance_data_s));
	int ret;
	char edj_path[PATH_MAX] = {0, };
	Evas_Object *button = NULL;
	Evas_Object *label;


	curl_global_init(CURL_GLOBAL_ALL);

	if (content != NULL) {
		/* Recover the previous status with the bundle object. */
	}

	/* Window */
	ret = widget_app_get_elm_win(context, &wid->win);
	if (ret != WIDGET_ERROR_NONE) {
		dlog_print(DLOG_ERROR, LOG_TAG, "failed to get window. err = %d", ret);
		return WIDGET_ERROR_FAULT;
	}

	evas_object_resize(wid->win, w, h);

	/* Conformant */
	wid->conform = elm_conformant_add(wid->win);
	evas_object_size_hint_weight_set(wid->conform, EVAS_HINT_EXPAND, EVAS_HINT_EXPAND);
	elm_win_resize_object_add(wid->win, wid->conform);
	evas_object_show(wid->conform);

	/* Naviframe */
	wid->nf = elm_naviframe_add(wid->conform);
	elm_object_content_set(wid->conform, wid->nf);

	/* Eext Circle Surface*/
	wid->circle_surface = eext_circle_surface_naviframe_add(wid->nf);

	app_get_resource(EDJ_FILE, edj_path, (int)PATH_MAX);

	/* Interface of register favorite bus */
	wid->layout = elm_layout_add(wid->nf);
	elm_layout_file_set(wid->layout, edj_path, "info_layout");
	evas_object_size_hint_weight_set(wid->layout, EVAS_HINT_EXPAND, EVAS_HINT_EXPAND);
	evas_object_show(wid->layout);

	label = elm_label_add(wid->layout);
	if (exist_file()) {
		elm_object_text_set(label, "<font_size=15>대학동고시촌입구.우리집고등학교!</font>");
	} else {
		elm_object_text_set(label, "신림중.삼성고등학교.관악문화도서관");
	}
	elm_label_wrap_width_set(label, ELM_SCALE_SIZE(298));
	//evas_object_resize(label, w / 2, h / 3);
	//evas_object_move(label, w / 2, h / 3);
	elm_object_part_content_set(wid->layout, "elm.swallow.text", label);
	evas_object_size_hint_weight_set(label, EVAS_HINT_EXPAND, EVAS_HINT_EXPAND);
	evas_object_size_hint_align_set(label, EVAS_HINT_FILL, EVAS_HINT_FILL);
	evas_object_size_hint_min_set(label, 298, 34);
	evas_object_size_hint_max_set(label, 298, 34);
	elm_object_style_set(label, "slide_roll");
	elm_label_slide_duration_set(label, 3);
	elm_label_slide_mode_set(label, ELM_LABEL_SLIDE_MODE_AUTO);
	evas_object_show(label);
	elm_label_slide_go(label);

	button = elm_button_add(wid->layout);
	elm_object_style_set(button, "bottom");
	elm_object_text_set(button, "등록");
	elm_object_part_content_set(wid->layout, "elm.swallow.button", button);
	evas_object_smart_callback_add(button, "clicked", _button_clicked_cb, wid);
	evas_object_show(button);

	elm_naviframe_item_push(wid->nf, NULL, NULL, NULL, wid->layout, "empty");

	/* Show window after base gui is set up */
	evas_object_show(wid->win);

	widget_app_context_set_tag(context, wid);



	return WIDGET_ERROR_NONE;
}

static int
widget_instance_destroy(widget_context_h context, widget_app_destroy_type_e reason, bundle *content, void *user_data)
{
	if (reason != WIDGET_APP_DESTROY_TYPE_PERMANENT) {
		/* Save the current status at the bundle object. */
	}

	widget_instance_data_s *wid = NULL;
	widget_app_context_get_tag(context,(void**)&wid);

	if (wid->win)
		evas_object_del(wid->win);
	free(wid);

	curl_global_cleanup();

	return WIDGET_ERROR_NONE;
}

static int
widget_instance_pause(widget_context_h context, void *user_data)
{
	/* Take necessary actions when widget instance becomes invisible. */
	return WIDGET_ERROR_NONE;

}

static int
widget_instance_resume(widget_context_h context, void *user_data)
{

	/* Take necessary actions when widget instance becomes visible. */
	return WIDGET_ERROR_NONE;
}

static int
widget_instance_update(widget_context_h context, bundle *content,
                             int force, void *user_data)
{
	/* Take necessary actions when widget instance should be updated. */
	return WIDGET_ERROR_NONE;
}

static int
widget_instance_resize(widget_context_h context, int w, int h, void *user_data)
{
	/* Take necessary actions when the size of widget instance was changed. */
	return WIDGET_ERROR_NONE;
}

static void
widget_app_lang_changed(app_event_info_h event_info, void *user_data)
{
	/* APP_EVENT_LANGUAGE_CHANGED */
	char *locale = NULL;
	app_event_get_language(event_info, &locale);
	elm_language_set(locale);
	free(locale);
}

static void
widget_app_region_changed(app_event_info_h event_info, void *user_data)
{
	/* APP_EVENT_REGION_FORMAT_CHANGED */
}

static widget_class_h
widget_app_create(void *user_data)
{
	/* Hook to take necessary actions before main event loop starts.
	   Initialize UI resources.
	   Make a class for widget instance.
	*/
	app_event_handler_h handlers[5] = {NULL, };

	widget_app_add_event_handler(&handlers[APP_EVENT_LANGUAGE_CHANGED],
		APP_EVENT_LANGUAGE_CHANGED, widget_app_lang_changed, user_data);
	widget_app_add_event_handler(&handlers[APP_EVENT_REGION_FORMAT_CHANGED],
		APP_EVENT_REGION_FORMAT_CHANGED, widget_app_region_changed, user_data);

	widget_instance_lifecycle_callback_s ops = {
		.create = widget_instance_create,
		.destroy = widget_instance_destroy,
		.pause = widget_instance_pause,
		.resume = widget_instance_resume,
		.update = widget_instance_update,
		.resize = widget_instance_resize,
	};

	return widget_app_class_create(ops, user_data);
}

static void
widget_app_terminate(void *user_data)
{
	/* Release all resources. */
}

int
main(int argc, char *argv[])
{
	widget_app_lifecycle_callback_s ops = {0,};
	int ret;

	ops.create = widget_app_create;
	ops.terminate = widget_app_terminate;

	ret = widget_app_main(argc, argv, &ops, NULL);
	if (ret != WIDGET_ERROR_NONE) {
		dlog_print(DLOG_ERROR, LOG_TAG, "widget_app_main() is failed. err = %d", ret);
	}

	return ret;
}


