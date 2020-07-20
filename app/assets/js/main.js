import { initAll } from "lbh-frontend";
import Addresses from "./addresses";
import Loader from "./loader";

initAll();
new Addresses().init();
new Loader().init();
