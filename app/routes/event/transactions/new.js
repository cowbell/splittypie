import { inject as service } from "@ember/service";
import EmberObject, {
  setProperties,
  set,
  getWithDefault
} from "@ember/object";
import Route from "@ember/routing/route";
import moment from "moment";

export default Route.extend({
    notify: service(),
    transactionRepository: service(),
    userContext: service(),

    model(params) {
        const amount = getWithDefault(params, "amount", null);
        const date = getWithDefault(params, "date", moment().format("YYYY-MM-DD"));
        const event = this.modelFor("event");
        const name = getWithDefault(params, "name", null);
        const participants = event.users;
        const payer = this.userContext.currentUser;

        return EmberObject.create({
            amount,
            date,
            name,
            participants,
            payer,
        });
    },

    afterModel(model) {
        set(model, "event", this.modelFor("event"));
    },

    setupController(controller, model) {
        this._super(controller, model);
        const users = this.modelFor("event").users;
        const form = this.formFactory.createForm("expense", model);
        setProperties(controller, {
            form,
            users,
        });
    },

    renderTemplate() {
        this.render({ into: "application" });
    },

    actions: {
        modelUpdated(transaction) {
            const event = this.modelFor("event");

            this.transactionRepository
                .save(event, transaction)
                .then(() => {
                    this.transitionTo("event.transactions");
                    this.notify.success("New transaction has been added");
                });
        },
    },
});
