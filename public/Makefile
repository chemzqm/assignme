SHELL := /usr/local/bin/bash
PATH := ../node_modules/.bin:$(PATH)
SRC = $(wildcard client/*/*.js)
CSS = $(wildcard client/*/*.css)
HTML = $(wildcard client/*/*.html)
COMPONENT = $(wildcard client/*/component.json)
TEMPLATES = $(HTML:.html=.js)

build: components $(SRC) $(CSS) $(TEMPLATES)
	@component build --dev
	@touch build

components: $(COMPONENT)
	@component install --dev

check: $(SRC)
	@syntax-check $?

%.js: %.html
	@component convert $<

clean:
	rm -fr build components $(TEMPLATES)

.PHONY: clean save install
