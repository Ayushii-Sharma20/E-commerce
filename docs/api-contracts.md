1️⃣ Define API contracts (very important first)

Before writing backend code, decide what APIs the frontend will call.

Example API design:

Feature	Endpoint	                   Method	             Service
User register 	/api/users/register	POST	user-service


User login	/api/users/login	POST	user-service

Get products	/api/products	GET	product-service
Product details	/api/products/:id	GET	product-service
Place order	/api/orders	POST	order-service
Order history	/api/orders/:userId	GET	order-service
Check stock	/api/inventory/:productId	GET	inventory-servic