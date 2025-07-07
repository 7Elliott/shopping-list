const { createClient } = supabase

class ShoppingList {
    databaseName = "items"
    constructor(client) {
        this.client = client
        this.listId = null
    }

    setListId(id) {
        this.listId = id
    }

    async fetch() {
        let { data, error } = await this.client.from(this.databaseName)
            .select()
            .eq('list_id', this.listId)
        if (!error) {
            console.log('data: ', data)
            return data
        } else {
            console.log('error: ', data)
            throw error
        }
    }

    async addItem(name, userName) {
        return await this.client.from(this.databaseName).insert({
            name,
            user_name: userName,
            list_id: this.listId
        }).select()
    }

    async deleteItem(id) {
        return await this.client.from(this.databaseName)
            .delete()
            .eq('id', id)
            .eq('list_id', this.listId)
    }

    async fetchLists() {
        return await this.client.from('lists').select()
    }

    async addList(name) {
        return await this.client.from('lists').insert({ name }).select()
    }
}
