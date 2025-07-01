const { createClient } = supabase

class ShoppingList {
    databaseName = "items"
    listName = "shopping_list"
    listId = null
    constructor(client) {
        this.client = client
    }

    async initListId() {
        if (this.listId) return
        const { data, error } = await this.client.from('lists').select('id').eq('name', this.listName).single()
        if (error) {
            console.log('error fetching list id: ', error)
            throw error
        }
        this.listId = data.id
    }

    async fetch() {
        await this.initListId()
        let { data, error } = await this.client.from(this.databaseName).select().eq('list_id', this.listId)
        if (!error) {
            console.log('data: ', data)
            return data
        } else {
            console.log('error: ', data)
            throw error
        }
    }

    async addItem(name, userName) {
        await this.initListId()
        return await this.client.from(this.databaseName).insert({
            name,
            user_name: userName,
            list_id: this.listId
        }).select()
    }

    async deleteItem(id) {
        return await this.client.from(this.databaseName).delete().eq('id', id)
    }
}
class DailyTaskList extends ShoppingList {
    constructor(client) {
        super(client)
        this.listName = "daily_task"
    }
}
