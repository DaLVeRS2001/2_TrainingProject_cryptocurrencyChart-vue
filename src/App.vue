<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">

    <div class="container">
      <div class="w-full my-4"></div>
      <add-ticket @add-ticket="add"/>


      <template v-if="tickets.length">
        <switch-page-btn v-if="page > 1" @click="page -= 1">
          Назад
        </switch-page-btn>
        <switch-page-btn v-if="hasNextPage" @click="page += 1">
          Далее
        </switch-page-btn>

        <div>Фильтр: <input v-model="filter" @input="page = 1"></div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div v-for="(tick, idx) in paginatedTickets"
               class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
               :key="tick.name"
               :class="{'border-4': selectedTicket === tick}"
          >
            <div @click="selectTicket(tick)" class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{tick.name}}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{tick.price}}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <remove-ticket-btn @click="remove(idx)"/>
          </div>

        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <section v-if="selectedTicket" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicket.name }}
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div v-for="(line, idx) in normalizedGraph"
               :key="idx"
               :style="{height: `${line}%`}"
            :class="['bg-purple-800', 'border', 'w-10']"
          ></div>
        </div>
        <remove-graph-btn  @click="selectedTicket = null"/>
      </section>

    </div>
  </div>
</template>

<script>
import { api } from "./api/api";
import RemoveGraphBtn from './components/buttons/RemoveGraphBtn'
import RemoveTicketBtn from './components/buttons/RemoveTicketBtn'
import SwitchPageBtn from './components/buttons/SwitchPageBtn'
import AddTicket from "@/components/AddTicket";
export default {
  name: "App",
  components: {
    AddTicket,
    RemoveGraphBtn, RemoveTicketBtn, SwitchPageBtn
  },

  data() {
    return {
      tickets: [],
      selectedTicket: null,
      interval: {},
      graph: [],
      filter: "",
      page:1
    };
  },

  created() {
    const windowData = Object.fromEntries(new URL(location).searchParams.entries());

    const VALID_VALUE = ['filter', 'page']

    VALID_VALUE.forEach((key)=> {
      if(windowData[key]){
        this[key] = windowData[key]
      }
    })

    const tickersData = JSON.parse(localStorage.getItem("ticketsList"));
    if (tickersData) {
      this.tickets = tickersData;
      this.tickets.forEach(ticket => {
        this.subscribeToPriceUpdates(ticket.name);
      });
    }
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    hasNextPage() {
      return this.filteredTickets.length > this.endIndex;
    },
    filteredTickets() {
      return this.tickets.filter(ticket => ticket.name.includes(this.filter));
    },
    paginatedTickets() {
      return this.filteredTickets.slice(this.startIndex, this.endIndex);
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    },
    normalizedGraph() {
      const maxVal = Math.max(...this.graph);
      const minVal = Math.min(...this.graph);
      if (maxVal === minVal) {
        this.graph.map(() => 50);
      }
      return this.graph.map(price => 5 + ((price - minVal) * 100) / (maxVal - minVal));
    }
  },

  methods: {
    subscribeToPriceUpdates(ticketName) {
      this.interval[ticketName] = setInterval(async () => {
        api.getSingleSymbolPrice(ticketName)
          .then(price=> {
            this.tickets.find(t => t.name === ticketName).price = price > 1
              ? price.toFixed(2)
              : price.toPrecision(2);
            if (this.selectedTicket?.name === ticketName) {
              this.graph.push(price);
            }
          } )
      }, 3000);
    },
    add(ticket) {
      const currTicket = {
        name: ticket.toUpperCase(),
        price: "-"
      };
        this.tickets = [...this.tickets, currTicket];
      this.subscribeToPriceUpdates(currTicket.name);
    },
    remove(idx) {
      clearInterval(this.interval[this.tickets[idx].name]);
      console.log(this.tickets[idx]);
      if (this.selectedTicket === this.tickets[idx]) {
        this.selectedTicket = null;
      }
      this.tickets.splice(idx, 1);
      this.tickets = [...this.tickets];
    },
    selectTicket(tick) {
      this.selectedTicket = tick;
      console.log(tick);
    }
  },

  watch: {
    pageStateOptions(val) {
      const { origin, pathname } = location;
      history.pushState(null, null, `${origin + pathname}?filter=${val.filter}&page=${val.page}`);
    },
    tickets() {
      localStorage.setItem("ticketsList", JSON.stringify(this.tickets));
    },
    paginatedTickets() {
      if (this.paginatedTickets.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    selectedTicket() {
      this.graph = [];
    }
  }

};
</script>
<style src="./app.css"></style>