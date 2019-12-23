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
		return true;
	},
	getAmount(spec) {
		return _.random(0, 5);
	},
	getPrice(spec) {
		return _.random(3, 10) * 200;
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
