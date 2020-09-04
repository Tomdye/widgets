import { DojoEvent, RenderResult } from '@dojo/framework/core/interfaces';
import i18n from '@dojo/framework/core/middleware/i18n';
import { createICacheMiddleware } from '@dojo/framework/core/middleware/icache';
import { create, tsx } from '@dojo/framework/core/vdom';
import { Button } from '../button';
import { Label } from '../label';
import theme from '../middleware/theme';
import bundle from './nls/FileUploadInput';

import * as css from '../theme/default/file-upload-input.m.css';
import * as baseCss from '../theme/default/base.m.css';
import * as buttonCss from '../theme/default/button.m.css';
import * as fixedCss from './styles/file-upload-input.m.css';
import * as labelCss from '../theme/default/label.m.css';

export interface FileUploadInputChildren {
	label?: RenderResult;
	content?: RenderResult;
}

export interface FileUploadInputProperties {
	/** The `accept` attribute of the input */
	accept?: string | string[];

	/** If `true` file drag-n-drop is allowed. Default is `true` */
	allowDnd?: boolean;

	/** The `disabled` attribute of the input */
	disabled?: boolean;

	/** Hides the label for a11y purposes */
	labelHidden?: boolean;

	/** The `multiple` attribute of the input */
	multiple?: boolean;

	/** The `name` attribute of the input */
	name?: string;

	/** Callback called when the user selects files */
	onValue?(value: File[]): void;

	/** The `required` attribute of the input */
	required?: boolean;

	/** Represents if the input value is valid */
	valid?: ValidationInfo | boolean;

	/** The id to be applied to the input */
	widgetId?: string;
}

export interface ValidationInfo {
	message?: string;
	valid?: boolean;
}

interface FileUploadInputIcache {
	isDndActive?: boolean;
	shouldClick?: boolean;
}
const icache = createICacheMiddleware<FileUploadInputIcache>();

const factory = create({ i18n, icache, theme })
	.properties<FileUploadInputProperties>()
	.children<FileUploadInputChildren | undefined>();

export const FileUploadInput = factory(function FileUploadInput({
	children,
	id,
	middleware: { i18n, icache, theme },
	properties
}) {
	const {
		accept,
		allowDnd = true,
		disabled = false,
		labelHidden = false,
		multiple = false,
		name,
		onValue,
		required = false,
		valid = true,
		widgetId = `file-upload-input-${id}`
	} = properties();
	const { messages } = i18n.localize(bundle);
	const themeCss = theme.classes(css);
	const { content, label } = children()[0] || {};
	let isDndActive = icache.getOrSet('isDndActive', false);

	function onDragEnter(event: DragEvent) {
		event.preventDefault();
		icache.set('isDndActive', true);
	}

	function onDragLeave(event: DragEvent) {
		event.preventDefault();
		icache.set('isDndActive', false);
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		icache.set('isDndActive', false);

		if (onValue && event.dataTransfer && event.dataTransfer.files.length) {
			onValue(Array.from(event.dataTransfer.files));
		}
	}

	function onClickButton() {
		icache.set('shouldClick', true);
	}

	function onChange(event: DojoEvent<HTMLInputElement>) {
		if (onValue && event.target.files && event.target.files.length) {
			onValue(Array.from(event.target.files));
		}
	}

	return (
		<div
			key="root"
			classes={[
				theme.variant(),
				fixedCss.root,
				themeCss.root,
				isDndActive && themeCss.dndActive,
				disabled && themeCss.disabled
			]}
			ondragenter={allowDnd && onDragEnter}
			ondragover={allowDnd && onDragOver}
			ondrop={allowDnd && onDrop}
		>
			{label && (
				<Label
					disabled={disabled}
					forId={widgetId}
					hidden={labelHidden}
					required={required}
					theme={theme.compose(
						labelCss,
						css,
						'label'
					)}
					valid={typeof valid === 'boolean' ? valid : valid.valid}
				>
					{label}
				</Label>
			)}

			<div classes={[themeCss.wrapper]}>
				<input
					key="nativeInput"
					accept={accept}
					aria="hidden"
					classes={[baseCss.hidden]}
					click={function() {
						const shouldClick = Boolean(icache.getOrSet('shouldClick', false));
						shouldClick && icache.set('shouldClick', false, false);
						return shouldClick;
					}}
					disabled={disabled}
					multiple={multiple}
					name={name}
					onchange={onChange}
					required={required}
					type="file"
				/>
				<Button
					disabled={disabled}
					onClick={onClickButton}
					theme={theme.compose(
						buttonCss,
						css,
						'button'
					)}
				>
					{messages.chooseFiles}
				</Button>

				{allowDnd && <span classes={[themeCss.dndLabel]}>{messages.orDropFilesHere}</span>}
			</div>

			{content}

			{isDndActive && (
				<div
					key="overlay"
					classes={[
						fixedCss.dndOverlay,
						themeCss.dndOverlay,
						!isDndActive && baseCss.hidden
					]}
					ondragleave={allowDnd && onDragLeave}
				/>
			)}
		</div>
	);
});

export default FileUploadInput;
