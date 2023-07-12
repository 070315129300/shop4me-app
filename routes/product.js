const express = require('express');
const config = require('config');
const router = express.Router();
const authe = require('../middleware/auth');
var mongoose = require('mongoose'),
	Keywords = mongoose.model('Keyword');

var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var Userdetail = mongoose.model('userdetail');
var TransLog = mongoose.model('Trans');
const upload = require('../middleware/uploadMiddleware'),
	Resize = require('../middleware/Resize'),
	BagItem = mongoose.model('BagItem'),
	Bag = mongoose.model('Bag'),
  Tag = require('../api/models/tagModel'),
  Promo = require('../api/models/promo-model'),
	path = require('path');

//get products specific to a particular vendor
router.get('/', authe, async (req, res) => {
	Product.find({ vendor: req.vendor.id })
		.sort({ date: -1 })
		.then((products) => {
			if (!products) {
				return res.status(400).joson({ error: true, message: 'No products found for this user' });
			} else {
				return res.status(200).json(products);
			}
		})
		.catch((err) => {
			return res.status(500).json({ error: true });
		});
});

router.post('/app', upload.single('image'), async (req, res) => {
	try {
		//Check if the user is authourised
		if (!req.get('Authorization')) {
			return res.status(401).json({ msg: 'Unauthorized access' });
		}

		console.log('its using my new route for mobile');

		//create userDetail for the vendor, if userdetails is not present
		// find the user with api key
		let userdetails = await Userdetail.find({ user: req.get('Authorization') });
		//if userdetails is not found
		if (!userdetails.length) {
			console.log('vendor has no userdetails lets get him one');
			let userDetailFields = {};
			userDetailFields.user = req.get('Authorization');
			userDetailFields.lat = req.body.lat;
			userDetailFields.long = req.body.long;
			userdetails = new Userdetail(userDetailFields);
			await userdetails.save();
			console.log('userdetails created for this vendor, id is:' + userdetails[0].id);
		}

		// handle product image upload
		let filename;
		const imagePath = path.join(__dirname, '../../shop4me-app/uploads');
		const fileUpload = new Resize(imagePath);

		const {
			name,
			brand_name,
			price,
			details,
			category_name,
			status,
			reviews,
			trending,
			top_item,
			brandID,
			categoryID,
			delivery_channel,
			user_data,
			default_img
			// images
		} = req.body;

		let newkeyword = req.body.name.replace(/\s/g, '');
		if (req.body.name.trim() === null || req.body.name.trim() === '' || req.body.name.trim() === undefined) {
			res.status(400).json({ error: true, message: 'You can not add empty parameter' });
		} else {
			Keywords.findOne({ keyword: newkeyword }).then((keyword) => {
				if (!keyword) {
					let newKeyword = new Keywords({
						keyword: newkeyword
					})
						.save()
						.then(() => console.log('working'));
				} else {
					console.log('already saved');
				}
			});
		}

		console.log('name is ' + name);

		const productFields = {};
		productFields.vendor = req.get('Authorization');
		productFields.user = userdetails[0].id;
		if (name) productFields.name = name;
		if (brand_name) productFields.brand_name = brand_name;
		if (price) productFields.price = price;
		if (details) productFields.details = details;
		if (category_name) productFields.category_name = category_name;
		if (status) productFields.status = status;
		if (reviews) productFields.reviews = reviews;
		if (trending) productFields.trending = trending;
		if (top_item) productFields.top_item = top_item;
		if (brandID) productFields.brandID = brandID;
		if (categoryID) productFields.categoryID = categoryID;
		if (delivery_channel) productFields.delivery_channel = delivery_channel;
		if (user_data) productFields.user_data = req.get('Authorization');
		if (default_img) productFields.default_img = default_img;
		if (req.file || req.file !== undefined) {
			filename = await fileUpload.save(req.file.buffer).then((file) => {
				if (file) {
					productFields.images = 'https://user.shop4me.online/uploads/' + file;
				}
			});
		}

		//create product
		let product = new Product(productFields);
		await product.save();
		res.json({ product });

		//log adding of product
		var new_log = new TransLog({
			log_type: 'New Product Added',
			log_data: product.name,
			user_data: req.get('Authorization'),
			data_ref: product._id
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Server error');
	}
});

const saveTag = (tags, productId) => {
	return new Promise((resolve, reject) => {
		tags.map((tag, index) => {
			Tag.findOne({ name: tag.toLowerCase() })
				.then((foundTag) => {
					if (!foundTag) {
						const newTag = new Tag({
							name: tag.toLowerCase()
						}).save();
					}
					Product.findByIdAndUpdate(productId).then((product) => {
						if (product) {
							product.tags.push(tag.toLowerCase());
							//  product.images.push(image);
							product.save();
							resolve(product);
						}
					});
				})
				.catch((err) => {
					console.log('-> Saved tag: ', err.message);
					reject(err);
				});
		});
	});
};

const updateTag = (tags, productId) => {
	return new Promise((resolve, reject) => {
		tags &&
			tags.map((tag, index) => {
				Tag.findOne({ name: tag.toLowerCase() })
					.then((foundTag) => {
						if (!foundTag) {
							const newTag = new Tag({
								name: tag.toLowerCase()
							}).save();
						}
						Product.findByIdAndUpdate(productId, { $set: { tags: [] } }, { $new: true }).then((product) => {
							if (product) {
								console.log('Suppose tags: ', tag);
								product.tags.push(tag.toLowerCase());
								//  product.images.push(image);
								product.save();
								resolve(product);
							}
						});
					})
					.catch((err) => {
						console.log('-> Saved tag: ', err.message);
						reject(err);
					});
			});
	});
};

// router.post("/",async (req, res) => {
router.post('/', upload.single('image'), async (req, res) => {
	// try {
	if (!req.get('Authorization')) {
		return res.status(401).json({ msg: 'Unauthorized access' });
	}

	console.log('its using my new route');
	//destructure the incoming request body parameters

	let filename;
	const imagePath = path.join(__dirname, '../../shop4me-app/uploads');
	const fileUpload = new Resize(imagePath);

	const {
		user_id,
		name,
		brand_name,
		price,
		details,
		category_name,
		status,
		reviews,
		trending,
		top_item,
		brandID,
		category_id,
		delivery_channel,
		user_data,
		default_img,
		costPrice,
		lidPrice,
		productSize,
		quantity,

		images
	} = req.body;
	let newkeyword = req.body.name;
	console.log('The new product: ', req.body);

	// let newkeyword = req.body.name.replace(/\s/g, '');
	if (req.body.name.trim() === null || req.body.name.trim() === '' || req.body.name.trim() === undefined) {
		res.status(400).json({ error: true, message: 'You can not add empty parameter' });
	} else {
		Keywords.findOne({ keyword: newkeyword }).then((keyword) => {
			if (!keyword) {
				let newKeyword = new Keywords({
					keyword: newkeyword
				})
					.save()
					.then(() => console.log('working'));
			} else {
				console.log('already saved');
			}
		});
	}

	let imageBase = '';
	if (req.file || req.file !== undefined) {
		filename = await fileUpload.save(req.file.buffer).then((file) => {
			if (file) {
				imageBase = 'http://app.shop4me.online/' + file;
				// productFields.default_img = "http://lidsellers.com/" + file
			}
		});
	}

	const newProduct = new Product({
		vendor: req.get('Authorization'),
		user: req.body.user_id,
		name: req.body.name,
		brand_name: req.body.brand_name,
		price: req.body.price,
		costPrice: req.body.costPrice,
		lidPrice: req.body.lidPrice,
		productSize: req.body.productSize,
		quantity: req.body.quantity,
		details: req.body.details,
		category_name: req.body.category_name,
		category_id: req.body.category_id,
		status: req.body.status,
		reviews: req.body.reviews,
		trending: req.body.trending,
		top_item: req.body.top_item,
		brandID: req.body.brandID,
		categoryID: req.body.category_id,
		delivery_channel: req.body.delivery_channel,
		image: imageBase,
		default_img: imageBase,
		condition: req.body.condition,
		model: req.body.model,
		hot_products: req.body.hotProducts,
		top_item: req.body.topItem,
		user_data: req.get('Authorization')
	})
		.save()
		.then((product) => {
			product.images.push(imageBase);
			product.save();

			if (req.body.tags) {
				console.log('======++++', req.body.tags.split(','));
				let newSplitted = req.body.tags.split(',');
				console.log('++++++++++++++++', newSplitted);
				saveTag(newSplitted, product);
			}

			Product.findOneAndUpdate(
				{ _id: product._id },
				{
					$set: {
						top_item: req.body.top_item
					}
				}
			)
				.then((item) => {})
				.catch((err) => {
					console.log('>>>', err);
				});

			var new_log = new TransLog({
				log_type: 'New Product Added',
				log_data: product.name,
				user_data: req.get('Authorization'),
				data_ref: product._id
			}).save();
			res.json({ product });
		})
		.catch((err) => {
			console.log('ERR:', err);
			res.status(400).json({ error: true, message: 'Error adding product' });
		});
});

router.post('/update', upload.single('image'), async (req, res) => {
	if (!req.get('Authorization')) {
		return res.status(401).json({ msg: 'Unauthorized access' });
	}

	let filename;
	const imagePath = path.join(__dirname, '../../shop4me-app/uploads');
	const fileUpload = new Resize(imagePath);

	let newkeyword = req.body.name;
	console.log('The new product: ', newkeyword);

	if (req.body.name.trim() === null || req.body.name.trim() === '' || req.body.name.trim() === undefined) {
		res.status(400).json({ error: true, message: 'You can not add empty parameter' });
	} else {
		Keywords.findOne({ keyword: newkeyword }).then((keyword) => {
			if (!keyword) {
				let newKeyword = new Keywords({
					keyword: newkeyword
				})
					.save()
					.then(() => console.log('working'));
			} else {
				console.log('already saved');
			}
		});
	}

	let imageBase = '';
	if (req.file || req.file !== undefined) {
		filename = await fileUpload.save(req.file.buffer).then((file) => {
			if (file) {
				imageBase = 'http://app.shop4me.online/' + file;
			}
		});
	}
	const newProduct = new Product({
		vendor: req.get('Authorization'),
		user: req.body.user_id,
		name: req.body.name,
		brand_name: req.body.brand_name,
		price: req.body.price,
		costPrice: req.body.costPrice,
		lidPrice: req.body.lidPrice,
		productSize: req.body.productSize,
		quantity: req.body.quantity,
		details: req.body.details,
		category_name: req.body.category_name,
		category_id: req.body.category_id,
		status: req.body.status,
		reviews: req.body.reviews,
		trending: req.body.trending,
		top_item: req.body.top_item,
		brandID: req.body.brandID,
		categoryID: req.body.category_id,
		delivery_channel: req.body.delivery_channel,
		image: imageBase,
		default_img: imageBase,
		condition: req.body.condition,
		model: req.body.model,
		hot_products: req.body.hotProducts,
		top_item: req.body.topItem,
		user_data: req.get('Authorization')
	})
		.save()
		.then((product) => {
			product.images.push(imageBase);
			product.save();

			let newSplitted = req.body.tags.split(',');
			// saveTag(newSplitted, product)
			console.log('++++++++++++++++++++', req.body.tags);

			updateTag(req.body.tags, product._id);

			var new_log = new TransLog({
				log_type: 'New Product Added',
				log_data: product.name,
				user_data: req.get('Authorization'),
				data_ref: product._id
			}).save();
			res.json({ product });
		})
		.catch((err) => {
			res.status(400).json({ error: true, message: 'Error adding product' });
		});
});

router.post('/search', async (req, res) => {
	let products = await Product.find({ name: { $regex: req.body.searchTerm, $options: 'i' } });
	return res.status(200).json({ error: false, results: products });
});

router.post('/updateImage', upload.single('image'), async (req, res) => {
	if (!req.get('Authorization')) {
		return res.status(401).json({ msg: 'Unauthorized access' });
	}

	if (!req.body.id) {
		return res.status(400).json({ error: true, message: 'id is required' });
	}
	console.log('===', req.file);

	let filename;
	const imagePath = path.join(__dirname, '../uploads');
	const fileUpload = new Resize(imagePath);
	let newkeyword = req.body.name;
	console.log('The new product: ', newkeyword);

	let imageBase = '';
	if (req.file || req.file !== undefined) {
		filename = await fileUpload.save(req.file.buffer).then((file) => {
			if (file) {
				imageBase = 'https://app.shop4me.online/' + file;
			}

			Product.findOneAndUpdate(
				{
					_id: req.body.id
				},
				{
					$set: {
						default_img: imageBase
					}
				}
			)
				.then((image) => {
					image.images.push(imageBase);
					image
						.save()
						.then((item) => {
							console.log('Done', image);
							res.status(200).json({ error: false, message: 'updated' });
						})
						.catch((err) => {
							console.log('err: ', err);
						});
				})
				.catch((err) => {
					res.status(400).json({ error: true, message: 'fail to update' });

					console.log('there is error', err);
				});
		});
	} else {
		return res.status(400).json({ error: true, message: 'File is required' });
	}
});

router.post('/deleteImage', (req, res) => {
	const iIndex = req.body.imageIndex;

	// if (!req.get("Authorization")) {
	//     return res.status(401).json({ msg: "Unauthorized access" });
	//  }

	if (!req.body.id) {
		return res.status(400).json({ error: true, message: 'id is required' });
	}
	if (!iIndex) {
		return res.status(400).json({ error: true, message: 'imageIndex is required' });
	}
	Product.findOne({ _id: req.body.id }).then((product) => {
		if (product) {
			console.log(' prod index: ', product.images.length);
			if (iIndex > product.images.length) {
				return res.status(401).json({ error: true, message: 'Invalid imageIndex' });
			} else {
				if (product.images.length === 1) {
					product.images = [];
					product.default_img = 'https://app.shop4me.online/lidstore.png';
					product
						.save()
						.then((prod) => {
							return res.status(200).json({ error: false, message: 'Image deleted', product: prod });
						})
						.catch((err) => {
							return res.status(400).json({ error: true, message: 'Error deleting image' });
						});
				} else {
					console.log('Go ahead: ', product.images[iIndex - 1]);
					let toDelete = product.images[iIndex - 1];
					let newImageArray = product.images;

					const newArr = product.images.filter((e) => e !== toDelete);

					if (toDelete === product.image) {
						product.default_img = newArr[newArr.length - 1];
						product.images = newArr;
						product
							.save()
							.then((prod) => {
								return res.status(200).json({ error: false, message: 'Image deleted', product: prod });
							})
							.catch((err) => {
								return res.status(400).json({ error: true, message: 'Error deleting image' });
							});
					} else {
						console.log('Just delete now: ');
						product.default_img = newArr[newArr.length - 1];
						product.images = newArr;
						product
							.save()
							.then((prod) => {
								return res.status(200).json({ error: false, message: 'Image deleted', product: prod });
							})
							.catch((err) => {
								return res.status(400).json({ error: true, message: 'Error deleting image' });
							});
					}
				}
			}
		}
	});
});

router.post('/edit', async (req, res) => {
	try {
		const {
			name,
			brand_name,
			price,
			details,
			category_name,
			status,
			reviews,
			trending,
			top_item,
			brandID,
			category_id,
			user_data,
			default_img,
			images,
			costPrice,
			lidPrice,
			productSize,
			quantity,
			delivery_channel,
			available
		} = req.body;

		const productFields = {};
		// productFields.vendor = req.vendor.id;
		if (name) productFields.name = name;
		if (brand_name) productFields.brand_name = brand_name;

		if (costPrice) productFields.costPrice = costPrice;
		if (lidPrice) productFields.lidPrice = lidPrice;
		if (productSize) productFields.productSize = productSize;
		if (quantity) productFields.quantity = quantity;
		if (delivery_channel) productFields.delivery_channel = delivery_channel;

		if (price) productFields.price = price;
		if (details) productFields.details = details;
		if (category_name) productFields.category_name = category_name;
		if (status) productFields.status = status;
		if (reviews) productFields.reviews = reviews;
		if (trending) productFields.trending = trending;
		if (top_item) productFields.top_item = top_item;
		if (brandID) productFields.brandID = brandID;
		if (category_id) productFields.category_id = category_id;
		if (user_data) productFields.user_data = user_data;
		if (default_img) productFields.default_img = default_img;
		if (images) productFields.images = images;
		if (available) productFields.available = req.body.available;

		await Product.findOneAndUpdate({ _id: req.body.id }, req.body, function(err, product) {
			if (err) return res.json(err);

			updateTag(req.body.tags, product._id);
			Product.findOneAndUpdate(
				{ _id: product._id },
				{
					$set: {
						top_item: req.body.top_item,
						updated_date: new Date()
					}
				}
			)
				.then((item) => {})
				.catch((err) => {
					console.log('>>>', err);
				});
			res.json(product);
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).json('Server error');
	}
});

const deleteFromEveryBag = (productId) => {
	BagItem.find({ product: productId }).then((bagItem) => {
		console.log('===>', bagItem);
		bagItem.forEach((element) => {
			Bag.findOne({ bagitem: element._id })
				.then((bag) => {
					if (bag) {
						console.log('++Bag item', bag.bagitem);
						bag.bagitem.pull(element._id);
						bag.save().then(() => {
							BagItem.findOneAndRemove({ _id: element._id }).then(() => {
								console.log('done');
							});
						});
						console.log('===>', bag);
					} else {
						console.log('Bag not found');
					}
				})
				.catch((err) => {
					console.log('+> Error msg: ', err.message);
				});
		});
	});
};

router.get('/getProduct/:id', (req, res) => {
	Product.findOne({ _id: req.params.id })
		.then((product) => {
			return res.status(200).json({ error: false, product });
		})
		.catch((err) => {
			return res.status(400).json({ error: true, message: 'Error fetching image' });
		});
});
router.get('/upper', (req, res) => {
	Product.find({})
		.then((prod) => {
			console.log('ppp', prod);
			if (prod) {
				console.log('====', prod);
				prod.available = true;
				prod
					.save()
					.then((pro) => {
						console.log('>>', pro);
					})
					.catch((err) => {
						console.log('ERR: ', err);
					});
			}
		})
		.catch((err) => {
			console.log('ERR: ', err);
		});
});

module.exports = router;
