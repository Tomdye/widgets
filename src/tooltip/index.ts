import { DNode } from '@dojo/framework/core/interfaces';
import { ThemedMixin, ThemedProperties, theme } from '@dojo/framework/core/mixins/Themed';
import { v } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import { formatAriaProperties } from '../common/util';

import * as fixedCss from './styles/tooltip.m.css';
import * as css from '../theme/tooltip.m.css';

/**
 * @type TooltipProperties
 *
 * Properties that can be set on Tooltip components
 *
 * @property aria
 * @property content           Information to show within the tooltip
 * @property open              Determines if this tooltip is visible
 * @property orientation       Where this tooltip should render relative to its child
 */
export interface TooltipProperties extends ThemedProperties {
	aria?: { [key: string]: string | null };
	content: DNode;
	open?: boolean;
	orientation?: Orientation;
}

// Enum used to position the Tooltip
export enum Orientation {
	bottom = 'bottom',
	left = 'left',
	right = 'right',
	top = 'top'
}

const fixedOrientationCss: { [key: string]: any } = fixedCss;
const orientationCss: { [key: string]: any } = css;

@theme(css)
export class Tooltip extends ThemedMixin(WidgetBase)<TooltipProperties> {
	protected getFixedModifierClasses(): (string | null)[] {
		const { orientation = Orientation.right } = this.properties;

		return [fixedCss.rootFixed, fixedOrientationCss[`${orientation}Fixed`]];
	}

	protected getModifierClasses(): (string | null)[] {
		const { orientation = Orientation.right } = this.properties;

		return [orientationCss[orientation]];
	}

	protected renderContent(): DNode {
		const { aria = {} } = this.properties;
		return v(
			'div',
			{
				...formatAriaProperties(aria),
				classes: [this.theme(css.content), fixedCss.contentFixed],
				key: 'content'
			},
			[this.properties.content]
		);
	}

	protected renderTarget(): DNode {
		return v('div', { key: 'target' }, this.children);
	}

	render(): DNode {
		const { open } = this.properties;
		const classes = this.getModifierClasses();
		const fixedClasses = this.getFixedModifierClasses();

		return v(
			'div',
			{
				classes: [...this.theme(classes), ...fixedClasses]
			},
			[this.renderTarget(), open ? this.renderContent() : null]
		);
	}
}

export default Tooltip;
