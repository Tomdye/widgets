import { create, tsx } from '@dojo/framework/core/vdom';
import List from '@dojo/widgets/list';
import icache from '@dojo/framework/core/middleware/icache';
import Example from '../../Example';
import { createResourceTemplate } from '@dojo/widgets/resources';

interface User {
	firstName: string;
	lastName: string;
}

const template = createResourceTemplate<User>({
	read: async (request, { put }) => {
		const { offset, size, query } = request;
		let url = `https://mixolydian-appendix.glitch.me/user?`;

		const pageNumber = offset / size + 1;
		url = `${url}page=${pageNumber}&size=${size}`;

		if (query) {
			Object.keys(query).forEach((key) => {
				if (query[key as keyof User]) {
					url = `${url}&${key}=${query[key as keyof User]}`;
				}
			});
		}

		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data: {
			data: User[];
			total: number;
		} = await response.json();

		put(
			{
				data: data.data,
				total: data.total
			},
			request
		);
	}
});

const factory = create({ icache });

export default factory(function FetchedResource({ middleware: { icache } }) {
	return (
		<Example>
			<List
				resource={template({ transform: { value: 'firstName', label: 'firstName' } })}
				onValue={(value: string) => {
					icache.set('value', value);
				}}
				itemsInView={10}
			/>
			<p>{`Clicked on: ${icache.getOrSet('value', '')}`}</p>
		</Example>
	);
});
