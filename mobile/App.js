import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import axios from "axios";
import * as Location from "expo-location";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://10.0.2.2:5000/api";

const Stack = createNativeStackNavigator();

const styles = {
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16
  },
  title: {
    fontSize: 20,
    color: "#e5e7eb",
    fontWeight: "600",
    marginBottom: 12
  },
  input: {
    backgroundColor: "#020617",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#e5e7eb",
    marginBottom: 8
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4
  },
  buttonText: {
    color: "white",
    fontWeight: "500"
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
    padding: 12,
    marginBottom: 8
  }
};

const api = axios.create({ baseURL: API_BASE });

function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setError("");
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      navigation.replace("Shops");
    } catch (e) {
      setError(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6b7280"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {error ? (
        <Text style={{ color: "#f97316", fontSize: 12, marginBottom: 4 }}>
          {error}
        </Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 12 }}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={{ color: "#9ca3af", fontSize: 12 }}>
          New here? Create an account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setError("");
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role: "customer"
      });
      const token = res.data.token;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      navigation.replace("Shops");
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed");
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create account</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#6b7280"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6b7280"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {error ? (
        <Text style={{ color: "#f97316", fontSize: 12, marginBottom: 4 }}>
          {error}
        </Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

function ShopsScreen({ navigation }) {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api
      .get("/shops")
      .then((res) => setShops(res.data))
      .catch((e) => console.log(e));
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Nearby shops</Text>
      <FlatList
        data={shops}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ShopDetails", { shop: item })}
          >
            <Text style={{ color: "#e5e7eb", fontWeight: "500" }}>
              {item.name}
            </Text>
            <Text style={{ color: "#a5b4fc", fontSize: 12 }}>
              {item.category}
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>
              {item.description || "No description"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function ShopDetailsScreen({ route }) {
  const { shop } = route.params;
  const [queue, setQueue] = useState([]);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");

  const loadQueue = () => {
    api
      .get(`/tokens/${shop._id}`)
      .then((res) => setQueue(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const join = async () => {
    try {
      setJoining(true);
      setMessage("");
      const { status } = await Location.requestForegroundPermissionsAsync();
      let loc = null;
      if (status === "granted") {
        const geo = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        loc = {
          lat: geo.coords.latitude,
          lng: geo.coords.longitude,
          accuracy: geo.coords.accuracy,
          source: "expo",
          timestamp: Date.now()
        };
      }
      const res = await api.post(`/tokens/${shop._id}/join`, {
        locationSnapshot: loc
      });
      setMessage(`Joined queue. Token #${res.data.tokenNumber}`);
      loadQueue();
    } catch (e) {
      setMessage("Failed to join queue");
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{shop.name}</Text>
      <Text style={{ color: "#a5b4fc", marginBottom: 8 }}>{shop.category}</Text>
      <TouchableOpacity style={styles.button} onPress={join} disabled={joining}>
        <Text style={styles.buttonText}>
          {joining ? "Joining..." : "Join queue"}
        </Text>
      </TouchableOpacity>
      {message ? (
        <Text style={{ color: "#e5e7eb", fontSize: 12, marginTop: 8 }}>
          {message}
        </Text>
      ) : null}
      <Text
        style={{
          color: "#9ca3af",
          marginTop: 16,
          marginBottom: 8,
          fontSize: 12
        }}
      >
        Current queue
      </Text>
      <FlatList
        data={queue}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ color: "#e5e7eb" }}>Token #{item.tokenNumber}</Text>
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>
              Status: {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#020617" },
          headerTintColor: "#e5e7eb"
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Token Manager" }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Shops" component={ShopsScreen} />
        <Stack.Screen
          name="ShopDetails"
          component={ShopDetailsScreen}
          options={({ route }) => ({ title: route.params.shop.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
