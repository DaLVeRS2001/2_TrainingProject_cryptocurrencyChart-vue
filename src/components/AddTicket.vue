<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticket"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
            @keypress.enter="add"
          />
        </div>
      </div>
    </div>
    <add-ticket-btn @click="add"/>
  </section>
</template>

<script>


import AddTicketBtn from "@/components/buttons/AddTicketBtn";
export default {
  components: {
    AddTicketBtn
  },

  emits: {
    'add-ticket': val=> typeof val === 'string'
  },

  data() {
    return { ticket: null };
  },

  methods: {
    add(){
      if (!this.ticket) return;
      this.$emit('add-ticket', this.ticket)
      this.ticket = ""
    }
  }
}
</script>