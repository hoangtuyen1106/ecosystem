import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { CategoriesService } from "../categories/categories.service";
import { DATABASE_CONNECTION } from "../database/database-connection";

@Injectable()
export class ProductsService {
    constructor(
        @Inject(DATABASE_CONNECTION) 
        private readonly database: NodePgDatabase<typeof schema>,
        private readonly categoriesService: CategoriesService
    ) {}

    async createProduct(
        product: Omit<typeof schema.products.$inferInsert, "id">
    ) {
        const category = await this.categoriesService.getCategoryByName(product.category);
        await this.database.insert(schema.products).values({
            ...product,
            price: category ? product.price + category.charge : product.price,
        });
    }
}