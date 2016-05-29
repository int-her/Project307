#include <tizen.h>
#include <storage.h>
#include <curl/curl.h>
#include <libxml/parser.h>
#include "main.h"

static int station_cur_index;
static int bus_cur_index;
static char station_name[256], display_name[256], adirection[64], display_number[64];

static int
writer(char *data, size_t size, size_t nmemb, void *user_data)
{
	*((xmlDocPtr *)user_data) = xmlReadMemory(data, strlen(data), NULL, NULL, 0);
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



static int
get_station_count()
{
	int error, internal_storage_id;
	int count = 0;
	char *dir, path[PATH_MAX] = {0,}, buf[1024];
	FILE *f;

	error = storage_foreach_device_supported(storage_cb, &internal_storage_id);
	if (error) return 0;
	storage_get_directory(internal_storage_id, STORAGE_DIRECTORY_DOCUMENTS, &dir);
	if (!exist_file())
	{
		return 0;
	}
	strcat(path, dir);
	strcat(path, "/TPO_files/TPO_favorite.tpo");
	free(dir);

	f = fopen(path, "r");
	fgets(buf, 1024, f);
	while(!feof(f))            // 파일의 끝을 만난 때 까지 루프
	{
		fgets(buf, 1024, f);
		count++;
	}

	return count;
}

static void
read_file(int station_index, int bus_index, char *station_number, char *bus_number, char *adirection, char *station_name)
{
	int error, internal_storage_id;
	int i, count;
	char *dir, path[PATH_MAX] = {0,}, buf[1024];
	FILE *f;

	error = storage_foreach_device_supported(storage_cb, &internal_storage_id);
	if (error) return;
	storage_get_directory(internal_storage_id, STORAGE_DIRECTORY_DOCUMENTS, &dir);
	if (!exist_file())
	{
		*station_number = -1;
		strcpy(bus_number, "not_found");
		return;
	}
	strcat(path, dir);
	strcat(path, "/TPO_files/TPO_favorite.tpo");
	free(dir);

	f = fopen(path, "r");
	fgets(buf, 1024, f);
	for (i = 0; i < station_index; i++)
	{
		fgets(buf, 1024, f);
	}
	fscanf(f, "%s ", station_number);
	fscanf(f, "%s ", station_name);
	fscanf(f, "%d", &count);
	if (bus_index >= count) {
		strcpy(bus_number, "over_count");
		return;
	}
	for (i = 0; i < bus_index; i++)
	{
		fscanf(f, " %s %s", buf, buf);
	}
	fscanf(f, " %s", bus_number);
	fscanf(f, " %s", adirection);
	fclose(f);
}

static int
get_arrival_time(widget_instance_data_s *wid, char *station_id, char *bus_number, char *adirection)
{
	CURL *curl;
	CURLcode res;
	xmlDocPtr doc = NULL;
	xmlNodePtr root, item, bus, ad, time;
	char url[1024] = {0, };
	int second = 30;

	/* Get a curl handle */
	curl = curl_easy_init();
	if (curl)
	{
		second += 2;
		/* Set restful API URL */
		strcpy(url, "http://http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?ServiceKey=4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==&arsId=");
		strcat(url, station_id);
		strcat(url, "&numOfRows=999&pageSize=999&pageNo=1&startPage=1");
		curl_easy_setopt(curl, CURLOPT_URL, url);
		curl_easy_setopt(curl, CURLOPT_HTTPGET, 1);
		curl_easy_setopt(curl,CURLOPT_WRITEFUNCTION, writer);
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, &doc);
		res = curl_easy_perform(curl);
		if (CURLE_OK == res)
		{
			if (doc != NULL)
			{
				second += 10;
				root = xmlDocGetRootElement(doc);
				item = root->children->next->next->children;
				for (; item; item = item->next)
				{
					for (bus = item->children; bus; bus = bus->next)
					{
						if (!xmlStrcmp(bus->name, (const xmlChar *)"rtNm"))
						{
							second += 60;
							break;
						}
					}
					for (ad = item->children; ad; ad = ad->next)
					{
						if (!xmlStrcmp(ad->name, (const xmlChar *)"adirection"))
						{
							second += 60;
							break;
						}
					}
					if (!xmlStrcmp(bus->content, (const xmlChar *)bus_number) &&
							!xmlStrcmp(ad->content, (const xmlChar *)adirection))
					{
						for (time = item->children; time; time = time->next)
						{
							if (!xmlStrcmp(time->name, (const xmlChar *)"traTime1"))
							{
								second += 60;
								break;
							}
						}
						break;
					}
				}
				sscanf(time->content, "%d", &second);
				xmlFreeDoc(doc);
			}
			second += 5;
		}
		curl_easy_cleanup(curl);
	}
	return second;
}

static void
update_information(widget_instance_data_s *wid)
{
	int second;
	char station_number[16] = {0, }, bus_number[32] = {0, }, bus_time[128] = {0, };
	xmlChar *temp;
	read_file(station_cur_index, bus_cur_index, station_number, bus_number, adirection, station_name);
	second = get_arrival_time(wid, station_number, bus_number, adirection);
	//temp = get_arrival_time(wid, station_number, bus_number, adirection);
	sprintf(display_name, "<font_size=25><align=center>%s</font></align>", station_name);
	sprintf(display_number, "<font_size=50><align=center>%s</font></align>", bus_number);
	sprintf(bus_time, "<font_size=25><align=center>%d</font></align>", second);

	elm_object_text_set(wid->label_station, display_name);
	elm_object_text_set(wid->btn_number, display_number);
	elm_object_text_set(wid->label_minite, bus_time);
}

static void
_label_station_clicked_cb(void *data, Evas_Object *obj, void *event_info)
{
	widget_instance_data_s *wid = data;
	char station_number[16], bus_number[32];

	bus_cur_index++;
	read_file(station_cur_index, bus_cur_index, station_number, bus_number, adirection, station_name);
	if (!strcmp(bus_number, "over_count"))
	{
		bus_cur_index = 0;
	}

	update_information(wid);
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
view_register_create(widget_instance_data_s *wid, int w, int h)
{
	wid->label_register = elm_label_add(wid->layout_register);
	elm_object_text_set(wid->label_register, "<font_size=29><align=center>즐겨찾기를 등록해주세요.</font></align>");
	evas_object_resize(wid->label_register, w, h / 5);
	evas_object_move(wid->label_register, 0, h / 3);

	wid->btn_register = elm_button_add(wid->layout_register);
	elm_object_style_set(wid->btn_register, "bottom");
	elm_object_text_set(wid->btn_register, "등록");
	elm_object_part_content_set(wid->layout_register, "elm.swallow.button", wid->btn_register);
	evas_object_smart_callback_add(wid->btn_register, "clicked", _button_clicked_cb, wid);
}

static void
view_favorite_create(widget_instance_data_s *wid, int w, int h)
{
	wid->label_station = elm_label_add(wid->layout_register);
	evas_object_resize(wid->label_station, w / 2, h / 5);
	evas_object_move(wid->label_station, w / 2 - w / 4, h / 6);
	elm_object_style_set(wid->label_station, "slide_short");
	elm_label_slide_duration_set(wid->label_station, 3);
	elm_label_slide_mode_set(wid->label_station, ELM_LABEL_SLIDE_MODE_ALWAYS);
	elm_label_slide_go(wid->label_station);

	wid->btn_number = elm_button_add(wid->layout_register);
	//elm_object_style_set(wid->btn_number, "focus");
	evas_object_resize(wid->btn_number, w / 2, h / 6);
	evas_object_move(wid->btn_number, w / 2 - w / 4, h / 3);
	evas_object_smart_callback_add(wid->btn_number, "clicked", _label_station_clicked_cb, wid);

	wid->label_minite = elm_label_add(wid->layout_register);
	evas_object_resize(wid->label_minite, w / 2, h / 5);
	evas_object_move(wid->label_minite, w / 2 - w / 4, 2 * h / 3);

	update_information(wid);

	wid->btn_alarm = elm_button_add(wid->layout_register);
	elm_object_style_set(wid->btn_alarm, "bottom");
	elm_object_text_set(wid->btn_alarm, "알람 등록");
	elm_object_part_content_set(wid->layout_register, "elm.swallow.button2", wid->btn_alarm);
	//evas_object_smart_callback_add(button, "clicked", _button_clicked_cb, wid);

}

static int
widget_instance_create(widget_context_h context, bundle *content, int w, int h, void *user_data)
{
	char edj_path[PATH_MAX] = {0, };
	widget_instance_data_s *wid = (widget_instance_data_s*) malloc(sizeof(widget_instance_data_s));
	int ret;


	if (content != NULL) {
		/* Recover the previous status with the bundle object. */
	}

	station_cur_index = 0;
	bus_cur_index = 0;
	curl_global_init(CURL_GLOBAL_ALL);

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

	app_get_resource(EDJ_FILE, edj_path, (int)PATH_MAX);

	/* Interface of register favorite bus */
	wid->layout_register = elm_layout_add(wid->nf);
	elm_layout_file_set(wid->layout_register, edj_path, "info_layout");
	evas_object_size_hint_weight_set(wid->layout_register, EVAS_HINT_EXPAND, EVAS_HINT_EXPAND);
	evas_object_show(wid->layout_register);

	view_register_create(wid, w, h);
	view_favorite_create(wid, w, h);

	elm_naviframe_item_push(wid->nf, NULL, NULL, NULL, wid->layout_register, NULL);

	if (exist_file()) {
		evas_object_hide(wid->label_register);
		evas_object_hide(wid->btn_register);
		evas_object_show(wid->label_station);
		evas_object_show(wid->label_number);
		evas_object_show(wid->label_minite);
		evas_object_show(wid->btn_number);
		evas_object_show(wid->btn_alarm);
	} else {
		evas_object_show(wid->label_register);
		evas_object_show(wid->btn_register);
		evas_object_hide(wid->label_station);
		evas_object_hide(wid->label_number);
		evas_object_hide(wid->label_minite);
		evas_object_hide(wid->btn_number);
		evas_object_hide(wid->btn_alarm);
	}

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

	xmlCleanupParser();
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
	widget_instance_data_s *wid = NULL;
	widget_app_context_get_tag(context,(void**)&wid);

	if (exist_file()) {
		evas_object_hide(wid->label_register);
		elm_object_text_set(wid->label_register, "");
		evas_object_hide(wid->btn_register);
		update_information(wid);
		evas_object_show(wid->label_station);
		evas_object_show(wid->label_number);
		evas_object_show(wid->label_minite);
		evas_object_show(wid->btn_alarm);
	} else {
		evas_object_show(wid->label_register);
		elm_object_text_set(wid->label_register, "<font_size=29><align=center>즐겨찾기를 등록해주세요.</font></align>");
		evas_object_show(wid->btn_register);
		evas_object_hide(wid->label_station);
		evas_object_hide(wid->label_number);
		evas_object_hide(wid->label_minite);
		elm_object_text_set(wid->label_station, "");
		elm_object_text_set(wid->label_number, "");
		elm_object_text_set(wid->label_minite, "");
		evas_object_hide(wid->btn_alarm);
	}

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


