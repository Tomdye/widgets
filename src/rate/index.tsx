import { focus } from '@dojo/framework/core/middleware/focus';
import { create, tsx } from '@dojo/framework/core/vdom';
import theme from '../middleware/theme';
import * as css from '../theme/default/rate.m.css';
import * as fixedCss from './rate.m.css';
import * as baseCss from '../common/styles/base.m.css';
import RadioGroup from '../radio-group';
import { createICacheMiddleware } from '@dojo/framework/core/middleware/icache';
import Icon from '../icon';
import { RenderResult } from '@dojo/framework/core/interfaces';

export interface RateProperties {
	/** Handler for when the value of the widget changes */
	onValue(value: number): void;
	/* Number of icons to show */
	max?: number;
	/* Initial value for this widget */
	initialValue?: number;
	/* Controlled value for this widget */
	value?: number;
	/* The form name for this rate widget */
	name?: string;
	/* Flag to indicate if half stars should be used */
	allowHalf?: boolean;
}

export interface RateChildren {
	label?: RenderResult;
	icon?: RenderResult;
}

interface RateIcache {
	value: number;
	valueHovered: number;
	initialValue: number;
	valueFocused: string;
	focused: boolean;
}

const factory = create({ focus, theme, icache: createICacheMiddleware<RateIcache>() })
	.properties<RateProperties>()
	.children<RateChildren | undefined>();

export const Rate = factory(function Radio({
	properties,
	id,
	children,
	middleware: { focus, theme, icache }
}) {
	const idBase = `rate-${id}`;
	const { onValue, max = 5, initialValue, allowHalf, name = idBase } = properties();
	let { value } = properties();
	const [{ label, icon } = { label: undefined, icon: undefined }] = children();

	const themeCss = theme.classes(css);
	const hoveredValue = icache.getOrSet('valueHovered', 0);

	if (value === undefined) {
		if (initialValue !== undefined) {
			const previousInitialValue = icache.get('initialValue');
			if (initialValue !== previousInitialValue) {
				icache.set('initialValue', initialValue);
				icache.set('value', initialValue);
			}
		}

		value = icache.getOrSet('value', 0);
	}

	const options = [];
	for (let i = 1; i <= max; i++) {
		options.push({ value: `${i}` });
	}

	const valueFocused = icache.getOrSet('valueFocused', '');
	const containsFocus = icache.getOrSet('focused', false);

	function renderRadio(stringValue: string, checked: (checked?: boolean) => boolean) {
		const numValue = parseFloat(stringValue);
		const visiblyChecked = hoveredValue
			? numValue <= hoveredValue
			: !!value && numValue <= value;

		return (
			<label
				classes={[fixedCss.labelFixed, themeCss.icon, visiblyChecked && themeCss.checked]}
				onmouseenter={() => {
					icache.set('valueHovered', numValue);
				}}
				onmouseleave={() => {
					icache.set('valueHovered', 0);
				}}
				title={stringValue}
			>
				<span classes={fixedCss.iconWrapperFixed}>
					{icon || <Icon size="medium" type="starIcon" />}
				</span>
				<input
					classes={baseCss.visuallyHidden}
					type="radio"
					checked={checked()}
					name={name}
					value={stringValue}
					onfocus={() => {
						icache.set('valueFocused', stringValue);
						icache.set('focused', true);
					}}
					onblur={() => {
						icache.set('focused', false);
					}}
					onchange={(event: Event) => {
						event.stopPropagation();
						const radio = event.target as HTMLInputElement;
						checked(radio.checked);
					}}
				/>
			</label>
		);
	}

	return (
		<div classes={[themeCss.root, theme.variant(), containsFocus && themeCss.focused]}>
			<RadioGroup
				key="radio-group"
				name={name}
				options={options}
				onValue={(value: string) => {
					const numberVal = parseFloat(value);
					icache.set('value', numberVal);
					icache.set('valueHovered', 0);
					onValue(numberVal);
				}}
			>
				{{
					label,
					radios: (name, radioGroup, options) => {
						return options.map(({ value: stringValue }) => {
							if (allowHalf) {
								const halfValue = `${parseFloat(stringValue) - 0.5}`;
								let focused = false;
								if (valueFocused === halfValue || valueFocused === stringValue) {
									focused = true;
								}
								return (
									<span
										classes={[
											fixedCss.halfWrapperFixed,
											focused && css.focusedStar
										]}
									>
										{renderRadio(halfValue, radioGroup(halfValue).checked)}
										{renderRadio(stringValue, radioGroup(stringValue).checked)}
									</span>
								);
							} else {
								return (
									<span
										classes={[valueFocused === stringValue && css.focusedStar]}
									>
										{renderRadio(stringValue, radioGroup(stringValue).checked)}
									</span>
								);
							}
						});
					}
				}}
			</RadioGroup>
		</div>
	);
});

export default Rate;
