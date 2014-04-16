SRC = $(wildcard client/*/*.js)
CSS = $(wildcard client/*/*.css)
COMPONENT = $(wildcard client/*/component.json)

build: components $(SRC) $(CSS)
	@component build --dev

components: $(COMPONENT)
	@component install

watch:
	@component build -w

check: $(SRC)
	@syntax-check $?

clean:
	rm -fr build components

.PHONY: clean save install
