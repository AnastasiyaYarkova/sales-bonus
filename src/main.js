/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, product) {
        // Получаем цену продажи и количество
        const { discount, sale_price, quantity } = purchase;
        return sale_price * quantity * (1 - discount / 100);
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;
    if (index === 0) {
        return +(seller.profit * 0.15).toFixed(2);
    } else if (index === 1 || index === 2) {
        return +(seller.profit * 0.1).toFixed(2);
    } else if (index === total - 1) {
        return 0;
    } else {
        return +(seller.profit * 0.05).toFixed(2);
    }
    // @TODO: Расчет бонуса от позиции в рейтинге
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    
    // @TODO: Проверка входных данных
    if (!data &&
        !Array.isArray(data.customers) &&
        data.customers.length === 0 &&
        !Array.isArray(data.sellers) &&
        data.sellers.length === 0 &&
        !Array.isArray(data.products) &&
        data.products.length === 0 &&
        !Array.isArray(data.purchases_records) &&
        data.purchases_records.length === 0) {
        throw new Error('Некорректные входные данные');
    }
    // @TODO: Проверка наличия опций
    if (typeof options !== 'object' ||
        typeof options.calculateRevenue !== 'function' ||
        typeof options.calculateBonus !== 'function') {
        throw new Error('Некорректные опции');
    }
    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        seller_id: seller.id, // Идентификатор продавца
        name: '${seller.first_name} ${seller.last_name}',
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
        // Заполним начальными данными
     })); 
    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = sellerStats.reduce((result, seller) => ({
        ...result,
        [seller.seller_id]: seller
    }), {});
    const productIndex = data.products.reduce((result, product) => ({
        ...result,
        [product.sku]: product
    }), {});
    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => { // Чек 
        const seller = sellerIndex[record.seller_id]; // Продавец
        if (!seller) return;
        seller.sales_count += 1;// Увеличить количество продаж 
        seller.revenue += record.total_amount;// Увеличить общую сумму всех продаж
        // Расчёт прибыли для каждого товара
        record.items.forEach(item => {
            const product = productIndex[item.sku]; // Товар
            if (!product) return;
            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            const cost = product.purchase_price * item.quantity;
            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            const revenue = calculateSimpleRevenue(item, product);
            // Посчитать прибыль: выручка минус себестоимость
            const itemProfit = revenue - cost;
            // Увеличить общую накопленную прибыль (profit) у продавца  
            seller.profit += itemProfit;
            // Учёт количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] = (seller.products_sold[item.sku] || 0) + item.quantity ;
            // По артикулу товара увеличить его проданное количество у продавца
        });
 }); 
 // @TODO: Сортировка продавцов по прибыли
 sellerStats.sort((a, b) => b.profit - a.profit);
// @TODO: Назначение премий на основе ранжирования
 sellerStats.forEach(seller => {
    // Считаем бонус
    seller.bonus = options.calculateBonus(seller);

    // Преобразуем объект с проданными товарами в массив из 10 самых продаваемых товаров
    const top_roducts = Object.entries(seller.products_sold) // Преобразуем в массив [[sku, quantity], ...]
        .map(([sku, quantity]) => ({ sku, quantity })) // Трансформируем в [{sku, quantity}, ...]
        .sort((a, b) => b.quantity - a.quantity) // Сортируем по убыванию quantity
        .slice(0, 10); // Берем только первые 10 элементов
seller.top_products = top_Products;
    });
// @TODO: Подготовка итоговой коллекции с нужными полями
return sellerStats.map(seller => ({
    seller_id: seller.seller_id, 
    name: seller.name, // Строка, имя продавца
    revenue: +seller.revenue.toFixed(2), 
    profit: +seller.profit.toFixed(2), 
    sales_count: seller.sales_count, 
    top_products: seller.top_products, 
    bonus: +seller.bonus.toFixed(2) 
}));
};
console.log(products_sold);