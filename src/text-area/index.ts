import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import { DNode } from '@dojo/framework/core/interfaces';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/framework/core/mixins/Themed';
import { FocusMixin, FocusProperties } from '@dojo/framework/core/mixins/Focus';
import { v, w } from '@dojo/framework/core/vdom';
import Focus from '@dojo/framework/core/meta/Focus';
import Label from '../label/index';
import { formatAriaProperties } from '../common/util';
import { uuid } from '@dojo/framework/core/util';
import * as css from '../theme/text-area.m.css';
import HelperText from '../helper-text/index';
import { InputValidity } from '@dojo/framework/core/meta/InputValidity';

/**
 * @type TextAreaProperties
 *
 * Properties that can be set on a TextInput component
 *
 * @property columns         Number of columns, controls the width of the textarea
 * @property rows            Number of rows, controls the height of the textarea
 * @property wrapText        Controls text wrapping. Can be "hard", "soft", or "off"
 * @property maxLength      Maximum number of characters allowed in the input
 * @property minLength      Minimum number of characters allowed in the input
 * @property placeholder    Placeholder text
 * @property value           The current value
 */
export interface TextAreaProperties extends ThemedProperties, FocusProperties {
	aria?: { [key: string]: string | null };
	onKeyDown?(key: number, preventDefault: () => void): void;
	onKeyPress?(key: number, preventDefault: () => void): void;
	onKeyUp?(key: number, preventDefault: () => void): void;
	onBlur?(): void;
	onFocus?(): void;
	onInput?(value?: string): void;
	columns?: number;
	rows?: number;
	wrapText?: 'hard' | 'soft' | 'off';
	maxLength?: number | string;
	minLength?: number | string;
	placeholder?: string;
	value?: string;
	valid?: { valid?: boolean; message?: string } | boolean;
	onValidate?: (valid: boolean | undefined, message: string) => void;
	customValidator?: (value: string) => { valid?: boolean; message?: string } | void;
	label?: string;
	labelHidden?: boolean;
	helperText?: string;
	disabled?: boolean;
	widgetId?: string;
	name?: string;
	readOnly?: boolean;
	required?: boolean;
}

@theme(css)
export class TextArea extends ThemedMixin(FocusMixin(WidgetBase))<TextAreaProperties> {
	private _dirty = false;

	private _onBlur() {
		this.properties.onBlur && this.properties.onBlur();
	}
	private _onFocus() {
		this.properties.onFocus && this.properties.onFocus();
	}
	private _onInput(event: Event) {
		event.stopPropagation();
		this.properties.onInput &&
			this.properties.onInput((event.target as HTMLInputElement).value);
	}
	private _onKeyDown(event: KeyboardEvent) {
		event.stopPropagation();
		this.properties.onKeyDown &&
			this.properties.onKeyDown(event.which, () => {
				event.preventDefault();
			});
	}
	private _onKeyPress(event: KeyboardEvent) {
		event.stopPropagation();
		this.properties.onKeyPress &&
			this.properties.onKeyPress(event.which, () => {
				event.preventDefault();
			});
	}
	private _onKeyUp(event: KeyboardEvent) {
		event.stopPropagation();
		this.properties.onKeyUp &&
			this.properties.onKeyUp(event.which, () => {
				event.preventDefault();
			});
	}

	private _callOnValidate(valid: boolean | undefined, message: string) {
		let { valid: previousValid } = this.properties;
		let previousMessage: string | undefined;

		if (typeof previousValid === 'object') {
			previousMessage = previousValid.message;
			previousValid = previousValid.valid;
		}

		if (valid !== previousValid || message !== previousMessage) {
			this.properties.onValidate && this.properties.onValidate(valid, message);
		}
	}

	private _validate() {
		const { customValidator, value = '' } = this.properties;

		if (value === '' && !this._dirty) {
			this._callOnValidate(undefined, '');
			return;
		}

		this._dirty = true;
		let { valid, message = '' } = this.meta(InputValidity).get('input', value);
		if (valid && customValidator) {
			const customValid = customValidator(value);
			if (customValid) {
				valid = customValid.valid;
				message = customValid.message || '';
			}
		}
		this._callOnValidate(valid, message);
	}

	protected get validity() {
		const { valid = { valid: undefined, message: undefined } } = this.properties;

		if (typeof valid === 'boolean') {
			return { valid, message: undefined };
		}

		return {
			valid: valid.valid,
			message: valid.message
		};
	}

	private _uuid = uuid();

	protected getRootClasses(): (string | null)[] {
		const { disabled, readOnly, required } = this.properties;
		const focus = this.meta(Focus).get('root');
		const { valid } = this.validity;
		return [
			css.root,
			disabled ? css.disabled : null,
			focus.containsFocus ? css.focused : null,
			valid === false ? css.invalid : null,
			valid === true ? css.valid : null,
			readOnly ? css.readonly : null,
			required ? css.required : null
		];
	}

	render(): DNode {
		const {
			aria = {},
			columns = 20,
			disabled,
			widgetId = this._uuid,
			label,
			maxLength,
			minLength,
			name,
			placeholder,
			readOnly,
			required,
			rows = 2,
			value,
			wrapText,
			theme,
			classes,
			labelHidden,
			helperText,
			onValidate
		} = this.properties;
		const focus = this.meta(Focus).get('root');

		onValidate && this._validate();
		const { valid, message } = this.validity;

		const computedHelperText = (valid === false && message) || helperText;

		return v(
			'div',
			{
				key: 'root',
				classes: this.theme(this.getRootClasses())
			},
			[
				label
					? w(
							Label,
							{
								theme,
								classes,
								disabled,
								focused: focus.containsFocus,
								valid,
								readOnly,
								required,
								hidden: labelHidden,
								forId: widgetId
							},
							[label]
					  )
					: null,
				v('div', { classes: this.theme(css.inputWrapper) }, [
					v('textarea', {
						id: widgetId,
						key: 'input',
						...formatAriaProperties(aria),
						classes: this.theme(css.input),
						cols: `${columns}`,
						disabled,
						focus: this.shouldFocus,
						'aria-invalid': valid === false ? 'true' : null,
						maxlength: maxLength ? `${maxLength}` : null,
						minlength: minLength ? `${minLength}` : null,
						name,
						placeholder,
						readOnly,
						'aria-readonly': readOnly ? 'true' : null,
						required,
						rows: `${rows}`,
						value,
						wrap: wrapText,
						onblur: this._onBlur,
						onfocus: this._onFocus,
						oninput: this._onInput,
						onkeydown: this._onKeyDown,
						onkeypress: this._onKeyPress,
						onkeyup: this._onKeyUp
					})
				]),
				w(HelperText, { text: computedHelperText, valid })
			]
		);
	}
}

export default TextArea;
