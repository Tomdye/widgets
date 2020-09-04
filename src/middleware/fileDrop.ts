// TODO: this module should probably be in @dojo/framework

import { create, destroy, node } from '@dojo/framework/core/vdom';
import { createICacheMiddleware } from '@dojo/framework/core/middleware/icache';

export interface DndResults {
	files?: File[];
	isDragging: boolean;
	isDropped: boolean;
}

function createResults(): DndResults {
	return {
		isDragging: false,
		isDropped: false
	};
}

const emptyResults = Object.freeze(createResults());

const icache = createICacheMiddleware<Record<string, DndResults>>();
const factory = create({ destroy, icache, node });

export const fileDrop = factory(function fileDrop({ middleware: { destroy, icache, node } }) {
	const handles: Function[] = [];

	destroy(function() {
		let handle: any;
		while ((handle = handles.pop())) {
			handle && handle();
		}
	});

	let hasDropBeenRead = false;
	let isOverlayVolatile = false;

	return {
		/**
		 * Get information for file DnD
		 * @param targetKey key of the node that will be the DnD target
		 * @param overlayKey key of a node that will be the active DnD overlay.
		 * If `overlayKey` is provided the node it refers to must be rendered at the time `fileDrop.get` is called.
		 * Event listeners will immediately be registered for it if it exists. If it does not exist then all event
		 * listeners will be registered on targetNode and overlay functionality will not work correctly.
		 */
		get(
			targetKey: string | number,
			overlayKey?: string | number
		): Readonly<DndResults> | undefined {
			const targetNode = node.get(targetKey);
			let overlayNode = overlayKey && node.get(overlayKey);

			if (!targetNode) {
				return;
			}

			const resultKey = String(targetKey);

			function onDragEnter(event: DragEvent) {
				event.preventDefault();

				const results = icache.get(resultKey);
				if (results && results.isDragging === false) {
					icache.set(resultKey, { ...results, isDragging: true });
				}
			}

			function onDragLeave(event: DragEvent) {
				event.preventDefault();

				const results = icache.get(resultKey);
				if (results && results.isDragging === true) {
					if (isOverlayVolatile) {
						overlayNode = undefined;
					}
					icache.set(resultKey, { ...results, isDragging: false });
				}
			}

			// The default action for this event is to reset the current drag operation so it is necessary to add
			// a handler to any valid DnD target that prevents the default action.
			// https://developer.mozilla.org/en-US/docs/Web/API/Document/dragover_event
			function preventDefault(event: DragEvent) {
				event.preventDefault();
			}

			function onDrop(event: DragEvent) {
				event.preventDefault();

				if (isOverlayVolatile) {
					overlayNode = undefined;
				}

				icache.set(resultKey, {
					isDragging: false,
					isDropped: true,
					files:
						event.dataTransfer && event.dataTransfer.files.length
							? Array.from(event.dataTransfer.files)
							: []
				});
			}

			if (!icache.has(resultKey)) {
				icache.set(resultKey, createResults());

				targetNode.addEventListener('dragenter', onDragEnter);
				targetNode.addEventListener('drop', onDrop);

				handles.push(function() {
					targetNode.removeEventListener('dragenter', onDragEnter);
					targetNode.removeEventListener('dragover', preventDefault);
					targetNode.removeEventListener('drop', onDrop);
				});

				if (overlayKey) {
					if (overlayNode) {
						overlayNode.addEventListener('dragleave', onDragLeave);

						handles.push(function() {
							if (overlayNode) {
								overlayNode.removeEventListener('dragleave', onDragLeave);
							}
						});
					} else {
						let dragoverCount = 0;
						targetNode.addEventListener('dragover', function temporaryDragOver(event) {
							console.count('temp dragover');
							event.preventDefault();

							overlayNode = node.get(overlayKey);
							if (overlayNode) {
								isOverlayVolatile = true;
								console.log('add listener to overlayNode');
								targetNode.addEventListener('dragover', preventDefault);
								targetNode.removeEventListener('dragover', temporaryDragOver);
								overlayNode.addEventListener('dragleave', onDragLeave);

								handles.push(function() {
									if (overlayNode) {
										overlayNode.removeEventListener('dragleave', onDragLeave);
									}
								});
							} else {
								dragoverCount += 1;
								console.count('dragOver');
							}

							if (dragoverCount > 10) {
								console.log('bail out, add listener to targetNode');
								targetNode.addEventListener('dragover', preventDefault);
								targetNode.removeEventListener('dragover', temporaryDragOver);
								targetNode.addEventListener('dragleave', onDragLeave);

								handles.push(function() {
									targetNode.removeEventListener('dragleave', onDragLeave);
								});
							}
						});
					}
				} else {
					targetNode.addEventListener('dragover', preventDefault);
					targetNode.addEventListener('dragleave', onDragLeave);

					handles.push(function() {
						targetNode.removeEventListener('dragleave', onDragLeave);
					});
				}

				return emptyResults;
			}

			let results = Object.assign({}, icache.get(resultKey));
			if (results.isDropped) {
				if (hasDropBeenRead) {
					results = createResults();
					icache.set(resultKey, results, false);
					hasDropBeenRead = false;
				} else {
					hasDropBeenRead = true;
				}
			}

			return results;
		}
	};
});

export default fileDrop;
