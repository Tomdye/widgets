import { DNode } from '@dojo/framework/core/interfaces';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import { v, w } from '@dojo/framework/core/vdom';
import Focus from '../../meta/Focus';
import Dialog from '../../dialog/index';

export default class App extends WidgetBase {
	private _modal = false;
	private _underlay = false;
	private _closeable = true;
	private _open = false;

	openDialog() {
		this._open = true;
		this.invalidate();
	}

	toggleModal(event: any) {
		this._modal = event.target.checked;
		this.invalidate();
	}

	toggleUnderlay(event: any) {
		this._underlay = event.target.checked;
		this.invalidate();
	}

	toggleCloseable(event: any) {
		this._closeable = event.target.checked;
		this.invalidate();
	}

	render(): DNode {
		return v('div', [
			v('button', {
				id: 'button',
				key: 'button',
				innerHTML: 'open dialog',
				onclick: this.openDialog
			}),
			w(
				Dialog,
				{
					key: 'dialog',
					title: 'Dialog',
					open: this._open,
					modal: this._modal,
					underlay: this._underlay,
					closeable: this._closeable,
					onRequestClose: () => {
						this._open = false;
						this.meta(Focus).set('button');
						this.invalidate();
					}
				},
				[
					`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Quisque id purus ipsum. Aenean ac purus purus.
				Nam sollicitudin varius augue, sed lacinia felis tempor in.`
				]
			),
			v('div', { classes: 'option' }, [
				v('input', {
					type: 'checkbox',
					id: 'modal',
					onchange: this.toggleModal
				}),
				v('label', {
					for: 'modal',
					innerHTML: 'modal'
				})
			]),
			v('div', { classes: 'option' }, [
				v('input', {
					type: 'checkbox',
					id: 'underlay',
					onchange: this.toggleUnderlay
				}),
				v('label', {
					for: 'underlay',
					innerHTML: 'underlay'
				})
			]),
			v('div', { classes: 'option' }, [
				v('input', {
					type: 'checkbox',
					id: 'closeable',
					onchange: this.toggleCloseable,
					checked: true
				}),
				v('label', {
					for: 'closeable',
					innerHTML: 'closeable'
				})
			])
		]);
	}
}
