// Supabase client is provided globally via <script> include

class ItemsDB {
    constructor(client) {
        this.client = client
    }

    async getLists() {
        const { data, error } = await this.client.from('lists').select()
        if (error) {
            console.log('error fetching lists: ', error)
            throw error
        }
        return data
    }

    async fetchItems(listId) {
        const { data, error } = await this.client
            .from('items')
            .select()
            .eq('list_id', listId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
        if (error) {
            console.log('error fetching items: ', error)
            throw error
        }
        return data
    }

    async addItem(listId, name, userName) {
        const { data, error } = await this.client.from('items').insert({
            name,
            user_name: userName,
            list_id: listId
        }).select()
        if (error) {
            console.log('error adding item: ', error)
            throw error
        }
        return data[0]
    }

    async deleteItem(id) {
        const { error } = await this.client.from('items').delete().eq('id', id)
        if (error) {
            console.log('error deleting item: ', error)
            throw error
        }
    }
}
