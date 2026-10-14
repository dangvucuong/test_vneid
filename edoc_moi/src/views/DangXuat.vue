<script lang="ts" setup>
import { to } from "@/utils/awaitTo";
import { useUserStore } from "@/store/modules/user";
import { useRoute, useRouter } from "vue-router";
import Storage from "@/utils/Storage";

const route = useRoute();
const router = useRouter();
onMounted(async () => {
  Storage.clear();
  setTimeout(() =>
    router.replace((route.query.redirect as string) ?? "/dang-nhap")
  );
});
</script>
