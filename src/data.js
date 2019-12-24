import getSkus from './getSkus';
import _ from 'lodash';

// specs
const specs = {
	model: [
		'iPhone 7',
		'iPhone 8',
		'iPhone X',
		'iPhone 11',
	],
	screen: [
		'4.7 inches Retina',
		'5.5 inches Retina'
	],
	capacity: [
		'64GB',
		'128GB',
		'256GB',
		'512GB',
	],
	plan: [
		'early bird',
		'normal',
	],
	color: [
		'White',
		'Black',
		'Gray',
		'Silver',
		'Gold',
	],
};

// skus composed with spec combination, amount and price
const skus = getSkus(specs, {
	isValid(spec) {
		if(
			spec.model === 'iPhone 7' && spec.capacity === '256GB' ||
			spec.model === 'iPhone 7' && spec.capacity === '512GB' ||
			spec.model === 'iPhone 8' && spec.capacity === '128GB' ||
			spec.model === 'iPhone 8' && spec.capacity === '512GB' ||
			spec.model === 'iPhone X' && spec.capacity === '64GB' ||
			spec.model === 'iPhone X' && spec.capacity === '256GB' ||
			spec.model === 'iPhone 11' && spec.capacity === '64GB' ||
			spec.model === 'iPhone 11' && spec.capacity === '128GB'
		) {
			return false;
		}
		return true;
	},
	getAmount() {
		return _.random(0, 5);
	},
	getPrice(spec) {
		let price;
		switch (spec.model) {
			case 'iPhone 7':
				price = 400;
				break;
			case 'iPhone 8':
				price = 500;
				break;
			case 'iPhone X':
				price = 800;
				break;
			case 'iPhone 11':
				price = 1000;
				break;
		}
		switch (spec.capacity) {
			case '64GB':
				price += 0;
				break;
			case '128GB':
				price += 100;
				break;
			case '256GB':
				price += 200;
				break;
			case '512GB':
				price += 300;
				break;
		}
		if(spec.screen === '5.5 inches Retina') {
			price += 200;
		}
		if(spec.plan === 'early bird') {
			price /= 2;
		}
		return price;
	},
});

// define which spec(s) make sku(s) primary
const primarySpecs = {
	plan: 'normal'
};

// skus data contain amount or not
const hasAmount = true;

// define which spec(s) can be selected with multiple values
const multiSpecs = ['color'];

export default {
	specs,
	skus,
	primarySpecs,
	hasAmount,
	multiSpecs,
};
