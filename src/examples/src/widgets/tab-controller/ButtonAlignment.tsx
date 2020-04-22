import { tsx, create } from '@dojo/framework/core/vdom';
import icache from '@dojo/framework/core/middleware/icache';

import TabContainer, { Align } from './node_modules/@dojo/widgets/tab-container';
import TabContent from './node_modules/@dojo/widgets/tab-container/TabContent';
import Select, { defaultTransform } from './node_modules/@dojo/widgets/select';
import { createMemoryResourceWithData } from '../list/memoryTemplate';
import Example from '../../Example';

const factory = create({ icache });
const options = [
	{ value: Align.top, label: 'Top' },
	{ value: Align.left, label: 'Left' },
	{ value: Align.right, label: 'Right' },
	{ value: Align.bottom, label: 'Bottom' }
];
const resource = createMemoryResourceWithData(options);

export default factory(function ButtonAlignment({ middleware: { icache } }) {
	const alignButtons = icache.getOrSet('align', Align.top);
	const tabs = [
		{ id: 'tab0', label: 'Tab One' },
		{ id: 'tab1', label: 'Tab Two' },
		{ id: 'tab2', label: 'Tab Three' },
		{ id: 'tab3', label: 'Tab Four' }
	];

	return (
		<Example>
			<div>
				<Select
					initialValue={alignButtons}
					resource={resource}
					transform={defaultTransform}
					onValue={(value) => {
						icache.set('align', value);
					}}
				/>
				<TabContainer alignButtons={alignButtons} tabs={tabs}>
					{(_tabs, isActive) => [
						<TabContent key="tab0" active={isActive('tab0')}>
							Hello Tab One
						</TabContent>,
						<TabContent key="tab1" active={isActive('tab1')}>
							Hello Tab Two
						</TabContent>,
						<TabContent key="tab2" active={isActive('tab2')}>
							Hello Tab Three
						</TabContent>,
						<TabContent key="tab3" active={isActive('tab3')}>
							Hello Tab Four
						</TabContent>
					]}
				</TabContainer>
			</div>
		</Example>
	);
});
