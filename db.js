const { createClient } = supabase

class ItemList {
    tableName = "items"
    constructor(client, listName) {
        this.client = client
        this.listName = listName
        this.listId = null
    }

    async init() {
        const { data, error } = await this.client.from('lists').select('id').eq('name', this.listName).single()
        if (error) throw error
        this.listId = data.id
    }

    async ensureListId() {
        if (!this.listId) {
            await this.init()
        }
    }

    async fetch() {
        await this.ensureListId()
        const { data, error } = await this.client.from(this.tableName).select().eq('list_id', this.listId)
        if (error) throw error
        return data
    }

    async addItem(name, userName) {
        await this.ensureListId()
        return await this.client.from(this.tableName).insert({
            name,
            user_name: userName,
            list_id: this.listId
        }).select()
    }

    async deleteItem(id) {
        return await this.client.from(this.tableName).delete().eq('id', id)
    }
}

class ShoppingList extends ItemList {
    constructor(client) {
        super(client, 'shopping_list')
    }
}

class DailyTaskList extends ItemList {
    constructor(client) {
        super(client, 'daily_task')
    }
}
