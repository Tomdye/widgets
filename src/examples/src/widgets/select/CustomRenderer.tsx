import { create, tsx } from '@dojo/framework/core/vdom';
import Select from '@dojo/widgets/select';
import icache from '@dojo/framework/core/middleware/icache';
import { ListItem, ListOption } from '@dojo/widgets/list';
import Example from '../../Example';
import { createMemoryResourceTemplate } from '@dojo/widgets/resources';

const factory = create({ icache });
const options = [{ value: 'cat' }, { value: 'dog' }, { value: 'fish' }];

const template = createMemoryResourceTemplate<ListOption>();

export default factory(function CustomRenderer({ middleware: { icache } }) {
	return (
		<Example>
			<Select
				resource={template({ data: options })}
				onValue={(value) => {
					icache.set('value', value);
				}}
			>
				{{
					label: 'Basic Select',
					items: ({ selected, value }, props) => {
						return (
							<ListItem {...props}>
								{selected && <span>✅ </span>}
								{value}
							</ListItem>
						);
					}
				}}
			</Select>
			<pre>{icache.getOrSet('value', '')}</pre>
		</Example>
	);
});
