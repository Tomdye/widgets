import { tsx, create } from '@dojo/framework/core/vdom';
import icache from '@dojo/framework/core/middleware/icache';
import TabContainer, { Align } from '@dojo/widgets/tab-container';
import Select, { defaultTransform } from '@dojo/widgets/select';
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
		{ name: 'Tab One' },
		{ name: 'Tab Two' },
		{ name: 'Tab Three' },
		{ name: 'Tab Four' }
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
					<div key="tab0">Hello Tab One</div>
					<div key="tab1">Hello Tab Two</div>
					<div key="tab2">Hello Tab Three</div>
					<div key="tab3">Hello Tab Four</div>
				</TabContainer>
			</div>
		</Example>
	);
});
