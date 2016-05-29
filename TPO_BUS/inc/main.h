#ifndef __main_H__
#define __main_H__

#include <efl_extension.h>
#include <widget_app.h>
#include <widget_app_efl.h>
#include <Elementary.h>
#include <dlog.h>
#include <app.h>

#ifdef  LOG_TAG
#undef  LOG_TAG
#endif
#define LOG_TAG "tpo_widget"

#define EDJ_FILE "edje/widget.edj"

#if !defined(PACKAGE)
#define PACKAGE "Jlkedqbso8.tpo_bus"
#endif

typedef struct widget_instance_data {
	Evas_Object *win;
	Evas_Object *conform;
	Evas_Object *nf;
	Evas_Object *layout_register;
	Evas_Object *label_register;
	Evas_Object *btn_register;
	Evas_Object *btn_alarm;
	Evas_Object *btn_number;
	Evas_Object *label_number;
	Evas_Object *label_minite;
	Evas_Object *label_station;
} widget_instance_data_s;

#endif /* __tpo_widget_H__ */
