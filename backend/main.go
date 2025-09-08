package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
)

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
	Body  string `json:"body"`
}

var (
	todos []Todo
	mu    sync.Mutex // to handle concurrent writes
)

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow all origins (you can restrict to specific domains here)
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func todoHandler(w http.ResponseWriter, r *http.Request) {
	todo := &Todo{}
	if err := json.NewDecoder(r.Body).Decode(todo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mu.Lock()
	todo.ID = len(todos) + 1
	todos = append(todos, *todo)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

func updateTodo(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 5 || parts[4] != "done" {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(parts[3])
	if err != nil {
		http.Error(w, "Invalid todo ID", http.StatusBadRequest)
		return
	}
	for i := range todos {
		if todos[i].ID == id {
			todos[i].Done = true
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(todos[i])
			return
		}
	}
}
func getToDos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}
func main() {
	router := http.NewServeMux()

	handler := withCORS(router)

	router.HandleFunc("GET /healthcheck", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
	router.HandleFunc("POST /api/todos", todoHandler)
	router.HandleFunc("PATCH /api/todos/{id}/done", updateTodo)
	router.HandleFunc("GET /api/todos", getToDos)

	server := http.Server{
		Addr:    ":4000",
		Handler: handler,
	}

	log.Println("Starting server on port :4000")
	server.ListenAndServe()
}
