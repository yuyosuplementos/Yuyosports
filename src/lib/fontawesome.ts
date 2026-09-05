import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// Next inyecta el CSS por su cuenta; sin esto FA lo agrega a mano y los
// iconos parpadean en tamaño gigante durante la carga.
config.autoAddCss = false;
