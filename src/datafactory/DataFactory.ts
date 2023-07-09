import mongoose, {
    Document,
    Model,
    FilterQuery,
    UpdateQuery,
    connect,
    ConnectOptions,
    QueryOptions,
    Aggregate,
    AggregateOptions,
    PopulateOptions,
    Schema
} from 'mongoose';

import logger from '../utils/logger';

interface PaginationOptions {
    page: number;
    limit: number;
}

class DataFactory {
    private models: Map < string, Model < any >> = new Map();
    private connectionOptions: ConnectOptions;

    constructor(mongoUrl: string, connectionOptions?: ConnectOptions) {
        this.connectionOptions = connectionOptions;
        connect(mongoUrl, this.connectionOptions || null);

        logger.debug({ event: "DataFactory" }, 'DataFactory initialized');
    }

    registerModel(modelName: string, schema: Schema): void {
        const model = this.models.get(modelName);
        if (model) {
            throw new Error(`Model '${modelName}' is already registered.`);
        }
        const createdModel = mongoose.model(modelName, schema);
        this.models.set(modelName, createdModel);

        logger.debug({ event: "DataFactory/model" }, `registered model ${modelName || null}`);
    }

    private getModel(modelName: string): Model < Document > {
        const model = this.models.get(modelName);
        if (!model) {
            throw new Error(`Model '${modelName}' is not registered.`);
        }
        return model;
    }

    async create(modelName: string, data: Partial < Document > ): Promise < Document > {
        const model = this.getModel(modelName);
        return model.create(data);
    }

    async findById(modelName: string, id: string): Promise < Document | null > {
        const model = this.getModel(modelName);
        return model.findById(id).exec();
    }

    async findOne(
        modelName: string,
        conditions: FilterQuery < Document > ,
        projection ? : Record < string, any > ,
        options ? : QueryOptions
    ): Promise < Document | null > {
        const model = this.getModel(modelName);
        return model.findOne(conditions, projection, options).exec();
    }

    async find(
        modelName: string,
        conditions: FilterQuery < Document > ,
        projection ? : Record < string, any > ,
        options ? : QueryOptions
    ): Promise < Document[] > {
        const model = this.getModel(modelName);
        return model.find(conditions, projection, options).exec();
    }

    async updateById(modelName: string, id: string, data: UpdateQuery < Document > ): Promise < Document | null > {
        const model = this.getModel(modelName);
        return model.findByIdAndUpdate(id, data, {
            new: true
        }).exec();
    }

    async updateOne(modelName: string, conditions: FilterQuery < Document > , data: UpdateQuery < Document > ): Promise < Document | null > {
        const model = this.getModel(modelName);
        return model.findOneAndUpdate(conditions, data, {
            new: true
        }).exec();
    }

    async deleteById(modelName: string, id: string): Promise < Document | null > {
        const model = this.getModel(modelName);
        return model.findByIdAndDelete(id).exec();
    }

    async deleteOne(modelName: string, conditions: FilterQuery < Document > ): Promise < Document | null > {
        const model = this.getModel(modelName);
        return model.findOneAndDelete(conditions).exec();
    }

    async count(modelName: string, conditions: FilterQuery < Document > ): Promise < number > {
        const model = this.getModel(modelName);
        return model.countDocuments(conditions).exec();
    }

    async findWithPagination(
        modelName: string,
        conditions: FilterQuery < Document > ,
        projection ? : Record < string, any > ,
        paginationOptions ? : PaginationOptions,
        sort ? : Record < string, 'asc' | 'desc' >
    ): Promise < {
        results: Document[];total: number
    } > {
        const model = this.getModel(modelName);
        const {
            page,
            limit
        } = paginationOptions || {
            page: 1,
            limit: 10
        };
        const skip = (page - 1) * limit;
        const query = model.find(conditions, projection).skip(skip).limit(limit);

        if (sort) {
            query.sort(sort);
        }

        const resultsPromise = query.exec();
        const totalPromise = this.count(modelName, conditions);

        const [results, total] = await Promise.all([resultsPromise, totalPromise]);

        return {
            results,
            total
        };
    }

    async aggregate(
        modelName: string,
        pipeline: any[],
        options ? : AggregateOptions
    ): Promise < Aggregate < any[] > | any[] > {
        const model = this.getModel(modelName);
        return model.aggregate(pipeline, options).exec();
    }

    async distinct(modelName: string, field: string, conditions: FilterQuery < Document > ): Promise < any[] > {
        const model = this.getModel(modelName);
        return model.distinct(field, conditions).exec();
    }

    async populate(
        modelName: string,
        document: Document | null,
        options: PopulateOptions
    ): Promise < Document | null > {
        if (!document) {
            return null;
        }

        await document.populate(options);
        return document;
    }

    async bulkCreate(modelName: string, data: Partial < Document > []): Promise < Document[] > {
        const model = this.getModel(modelName);
        return model.insertMany(data);
    }

    async bulkUpdate(
        modelName: string,
        conditions: FilterQuery < Document > ,
        update: UpdateQuery < Document > ,
        options ? : QueryOptions
    ): Promise < number > {
        const model = this.getModel(modelName);
        const result = await model.updateMany(conditions, update, options).exec();
        return result.modifiedCount || 0;
    }

    async bulkDelete(
        modelName: string,
        conditions: FilterQuery < Document > ,
        options ? : QueryOptions
    ): Promise < number > {
        const model = this.getModel(modelName);
        const result = await model.deleteMany(conditions, options).exec();
        return result.deletedCount || 0;
    }
}

export default DataFactory;